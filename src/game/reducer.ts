// ─────────────────────────────────────────────────────────────
//  Game state machine. Pure given an injected rng: the same state
//  + action + rng always produces the same next state, so it can
//  be driven from React (useGame) or from tests.
// ─────────────────────────────────────────────────────────────
import { BET_STAKE, BITES, CYCLES, SABOTAGE_HEAT, SHOP, SUSU_COOL } from "../config/balance";
import type { Action, BetResult, CharacterId, GameState, Mode, Outcome, Player, Rng, ShopItem } from "./types";
import {
  biteGain,
  biteHeat,
  draftOptions,
  makePlayer,
  rollBust,
  scoreBank,
  startingSabotage,
  startingSusu,
  startingTameng,
  surviveBusts,
} from "./rules";

// ── turn-derived helpers ─────────────────────────────────────
export const playerCount = (s: GameState) => s.players.length;
export const activeIndex = (s: GameState) => s.turn % playerCount(s);
export const currentCycle = (s: GameState) => Math.floor(s.turn / playerCount(s)) + 1;
export const isFinalRonde = (s: GameState) => currentCycle(s) === s.settings.cycles;
export const totalTurns = (s: GameState) => playerCount(s) * s.settings.cycles;

/** Default name for seat `i` given the mode (humans vs bots). */
const seatName = (i: number, mode: Mode) =>
  mode === "solo" ? (i === 0 ? "Kamu" : `Bot ${i}`) : `Pemain ${i + 1}`;

/** Build `count` players shaped for the mode (solo → seat 0 human, rest bots). */
function shapePlayers(count: number, mode: Mode, existing: Player[] = []): Player[] {
  const out: Player[] = [];
  for (let i = 0; i < count; i++) {
    const isBot = mode === "solo" && i > 0;
    const prev = existing[i];
    out.push(prev ? { ...prev, isBot } : makePlayer(i, seatName(i, mode), isBot));
  }
  return out;
}

export function initialState(rng: Rng): GameState {
  void rng;
  return {
    screen: "intro",
    mode: "local",
    settings: { cycles: CYCLES, shop: true },
    players: [makePlayer(0), makePlayer(1)],
    draftIdx: 0,
    draftOpts: draftOptions(),
    turn: 0,
    phase: "preturn",
    heat: 0,
    roundPts: 0,
    shieldUsed: false,
    feedback: "",
    outcome: null,
    pendingHeat: 0,
    usedSabo: [],
    bets: {},
    blockAsk: false,
  };
}

/** Reset the per-turn fields (heat, points, preturn bookkeeping). */
function freshTurn(s: GameState): GameState {
  return {
    ...s,
    phase: "preturn",
    heat: 0,
    roundPts: 0,
    shieldUsed: false,
    feedback: "",
    outcome: null,
    pendingHeat: 0,
    usedSabo: [],
    bets: {},
    blockAsk: false,
  };
}

/**
 * Advance to the next turn. Ends the game after the last turn, and drops into
 * the shop screen between rondes (when enabled). Used by both NEXT and SKIP_TURN.
 */
function advanceTurn(s: GameState): GameState {
  const nt = s.turn + 1;
  if (nt >= totalTurns(s)) return { ...s, screen: "gameover" };
  // a new ronde starts whenever nt is a multiple of the player count
  if (s.settings.shop && nt % playerCount(s) === 0) {
    return { ...freshTurn({ ...s, turn: nt }), screen: "shop" };
  }
  return freshTurn({ ...s, turn: nt });
}

/** Move from preturn into the eating phase with a starting heat. */
function startActive(s: GameState, startHeat: number): GameState {
  return {
    ...s,
    phase: "active",
    blockAsk: false,
    heat: startHeat,
    feedback: startHeat > 0 ? `Mulai dengan pedas +${startHeat} dari sambal lawan!` : "",
  };
}

/** Settle the round: apply banked points + spectator bets, build the Outcome. */
function resolve(
  s: GameState,
  busted: boolean,
  gained: number,
  breakdown: { raw: number; mult: number; hematBonus: number; final: boolean }
): GameState {
  const pIdx = activeIndex(s);

  const betResults: BetResult[] = Object.entries(s.bets)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const player = Number(k);
      const bet = v!;
      const correct = (busted && bet === "bust") || (!busted && bet === "aman");
      return { player, name: s.players[player].name, bet, correct, delta: correct ? BET_STAKE : -BET_STAKE };
    });

  const players = s.players.map((p, i) => {
    let score = p.score;
    if (i === pIdx && !busted) score += gained;
    const bet = s.bets[i];
    if (bet) score += (busted && bet === "bust") || (!busted && bet === "aman") ? BET_STAKE : -BET_STAKE;
    return { ...p, score: Math.max(0, score) };
  });

  const outcome: Outcome = { busted, gained, ...breakdown, bets: betResults };
  return { ...s, players, outcome, phase: "result" };
}

export function gameReducer(state: GameState, action: Action, rng: Rng = Math.random): GameState {
  switch (action.type) {
    // ── menu / settings ──
    case "GO_MENU":
      return { ...state, screen: "menu" };
    case "OPEN_SETTINGS":
      return { ...state, screen: "settings" };
    case "OPEN_TUTORIAL":
      return { ...state, screen: "tutorial" };
    case "SET_CYCLES":
      return { ...state, settings: { ...state.settings, cycles: Math.max(1, Math.min(8, action.cycles)) } };
    case "START_MODE":
      return {
        ...state,
        mode: action.mode,
        players: shapePlayers(2, action.mode),
        screen: "setup",
      };

    // ── setup ──
    case "SET_COUNT":
      return { ...state, players: shapePlayers(action.count, state.mode, state.players) };
    case "RENAME":
      return {
        ...state,
        players: state.players.map((p, i) => (i === action.index ? { ...p, name: action.name } : p)),
      };
    case "START_DRAFT":
      return {
        ...state,
        players: state.players.map((p, i) =>
          makePlayer(i, p.name.trim() || seatName(i, state.mode), p.isBot)
        ),
        draftIdx: 0,
        draftOpts: draftOptions([]),
        screen: "draft",
      };

    // ── draft (free pick; characters are unique across players) ──
    case "CHOOSE_CHAR": {
      const players = state.players.map((p, i) =>
        i === state.draftIdx
          ? {
              ...makePlayer(i, p.name, p.isBot),
              char: action.char,
              sabotage: startingSabotage(action.char),
              tameng: startingTameng(action.char),
              susu: startingSusu(action.char),
            }
          : p
      );
      const n = players.length;
      if (state.draftIdx + 1 < n) {
        const taken = players
          .slice(0, state.draftIdx + 1)
          .map((p) => p.char)
          .filter((c): c is CharacterId => c !== null);
        return { ...state, players, draftIdx: state.draftIdx + 1, draftOpts: draftOptions(taken) };
      }
      return freshTurn({ ...state, players, turn: 0, screen: "play" });
    }

    // ── preturn (spectators) ──
    case "TOGGLE_BET": {
      const cur = state.bets[action.player];
      return { ...state, bets: { ...state.bets, [action.player]: cur === action.bet ? undefined : action.bet } };
    }
    case "ADD_SABO":
      return {
        ...state,
        players: state.players.map((p, i) => (i === action.player ? { ...p, sabotage: p.sabotage - 1 } : p)),
        usedSabo: [...state.usedSabo, action.player],
        pendingHeat: state.pendingHeat + SABOTAGE_HEAT,
      };
    case "CONFIRM_PRETURN": {
      const me = state.players[activeIndex(state)];
      if (state.pendingHeat > 0 && me.tameng > 0) return { ...state, blockAsk: true };
      return startActive(state, state.pendingHeat);
    }
    case "USE_TAMENG": {
      const pIdx = activeIndex(state);
      const players = state.players.map((p, i) => (i === pIdx ? { ...p, tameng: p.tameng - 1 } : p));
      return startActive({ ...state, players }, 0);
    }
    case "ACCEPT_HEAT":
      return startActive(state, state.pendingHeat);

    // ── active (eating) ──
    case "SUAP": {
      const me = state.players[activeIndex(state)];
      const ch = me.char;
      const newHeat = state.heat + biteHeat(action.bite, ch);
      if (rollBust(newHeat, rng)) {
        if (!state.shieldUsed && surviveBusts(ch) > 0) {
          return { ...state, heat: newHeat, shieldUsed: true, feedback: "Perut baja nahan! Selamat sekali." };
        }
        return resolve({ ...state, heat: newHeat }, true, 0, { raw: 0, mult: 1, hematBonus: 0, final: isFinalRonde(state) });
      }
      const gain = biteGain(action.bite, ch, rng);
      return {
        ...state,
        heat: newHeat,
        roundPts: state.roundPts + gain,
        feedback: `Nyam ${BITES[action.bite].name}! +${gain} poin`,
      };
    }
    case "MINUM_SUSU": {
      const pIdx = activeIndex(state);
      const me = state.players[pIdx];
      if (me.susu <= 0 || state.heat <= 0) return state;
      return {
        ...state,
        players: state.players.map((p, i) => (i === pIdx ? { ...p, susu: p.susu - 1 } : p)),
        heat: Math.max(0, state.heat - SUSU_COOL),
        feedback: `Glek! Minum susu, pedas turun ${SUSU_COOL}.`,
      };
    }
    case "SAJIKAN": {
      if (state.roundPts === 0) return state;
      const me = state.players[activeIndex(state)];
      const b = scoreBank(state.roundPts, state.heat, me.char, isFinalRonde(state));
      return resolve(state, false, b.gained, b);
    }

    // ── result → next, or time-out skip ──
    case "NEXT":
      return advanceTurn(state);
    case "SKIP_TURN":
      // ran out of time: forfeit this round (no points) and move on
      return advanceTurn({ ...state, feedback: "Kehabisan waktu!" });

    // ── shop (between rondes) ──
    case "BUY": {
      const price = SHOP[action.item];
      const buyer = state.players[action.player];
      if (!buyer || buyer.score < price) return state;
      const field: Record<ShopItem, keyof Player> = { susu: "susu", tameng: "tameng", cabai: "sabotage" };
      const key = field[action.item];
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === action.player ? { ...p, score: p.score - price, [key]: (p[key] as number) + 1 } : p
        ),
      };
    }
    case "CLOSE_SHOP":
      return freshTurn({ ...state, screen: "play" });

    // ── replay with the same names/mode/settings (fresh scores + re-draft) ──
    case "RESTART": {
      const players = state.players.map((p, i) => makePlayer(i, p.name, p.isBot));
      return freshTurn({
        ...state,
        players,
        turn: 0,
        draftIdx: 0,
        draftOpts: draftOptions([]),
        screen: "draft",
      });
    }

    // ── game over → back to the menu (keep settings + mode) ──
    case "RESET":
      return {
        ...initialState(rng),
        screen: "menu",
        mode: state.mode,
        settings: state.settings,
        players: shapePlayers(state.players.length, state.mode, state.players.map((p) => makePlayer(0, p.name, p.isBot))),
      };

    default:
      return state;
  }
}

// ── online authority helpers ─────────────────────────────────

/** Is `seat` allowed to perform this action right now? (host validation) */
export function actionAllowed(state: GameState, seat: number, a: Action): boolean {
  switch (a.type) {
    case "CHOOSE_CHAR":
      return state.screen === "draft" && state.draftIdx === seat;
    case "TOGGLE_BET":
    case "ADD_SABO":
      return a.player === seat && a.player !== activeIndex(state);
    case "CONFIRM_PRETURN":
    case "USE_TAMENG":
    case "ACCEPT_HEAT":
    case "SUAP":
    case "MINUM_SUSU":
    case "SAJIKAN":
    case "NEXT":
      return activeIndex(state) === seat;
    default:
      return false; // lobby/menu actions are never sent over the wire
  }
}

/** Build a fresh, draft-ready state for an online game from seat names. */
export function startStateFor(names: string[], rng: Rng): GameState {
  let s = initialState(rng);
  s = gameReducer(s, { type: "START_MODE", mode: "local" }, rng);
  s = gameReducer(s, { type: "SET_COUNT", count: names.length }, rng);
  names.forEach((n, i) => {
    s = gameReducer(s, { type: "RENAME", index: i, name: n }, rng);
  });
  s = gameReducer(s, { type: "START_DRAFT" }, rng);
  // The shop is a local/​pass-and-play feature; keep online turns continuous.
  return { ...s, settings: { ...s.settings, shop: false } };
}
