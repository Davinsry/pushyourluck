// ─────────────────────────────────────────────────────────────
//  Game state machine. Pure given an injected rng: the same state
//  + action + rng always produces the same next state, so it can
//  be driven from React (useGame) or from tests.
// ─────────────────────────────────────────────────────────────
import { BET, BITES, CYCLES, SHOP, SUSU_COOL } from "../config/balance";
import type { Action, BetResult, BiteId, CharacterId, GameState, Mode, Outcome, Player, Rng, ShopItem, Wager } from "./types";
import {
  biteGain,
  biteHeat,
  draftOptions,
  makePlayer,
  rollBust,
  scoreBank,
  startingSusu,
  startingTerawang,
  surviveBusts,
} from "./rules";

// ── turn-derived helpers ─────────────────────────────────────
export const playerCount = (s: GameState) => s.players.length;
export const activeIndex = (s: GameState) => s.turn % playerCount(s);
export const currentCycle = (s: GameState) => Math.floor(s.turn / playerCount(s)) + 1;
export const isFinalRonde = (s: GameState) => currentCycle(s) === s.settings.cycles;
export const totalTurns = (s: GameState) => playerCount(s) * s.settings.cycles;

const getSavedUsername = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("push_your_luck_username") || "";
  }
  return "";
};

/** Default name for seat `i` given the mode (humans vs bots). */
const seatName = (i: number, mode: Mode) => {
  if (i === 0) {
    const saved = getSavedUsername();
    if (saved) return saved;
  }
  return mode === "solo" ? (i === 0 ? "Kamu" : `Bot ${i}`) : `Pemain ${i + 1}`;
};

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

function shuffleBowls(rng: Rng): BiteId[] {
  const arr: BiteId[] = ["ijo", "rawit", "carolina"];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
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
    passiveShieldActivated: false,
    feedback: "",
    outcome: null,
    bets: {},
    secretBowls: [],
    terawangActive: false,
    terawangUsed: false,
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
    passiveShieldActivated: false,
    feedback: "",
    outcome: null,
    bets: {},
    secretBowls: [],
    terawangActive: false,
    terawangUsed: false,
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

/** Move from preturn into the eating phase. Secretly roll the bowls. */
function startActive(s: GameState, rng: Rng): GameState {
  const pIdx = activeIndex(s);
  const me = s.players[pIdx];
  const usePassive = me.char === "baja" && s.passiveShieldActivated && me.passiveShields > 0;

  const players = s.players.map((p, i) => {
    if (i === pIdx) {
      const oldStats = p.stats ?? { ijoCount: 0, rawitCount: 0, carolinaCount: 0, maxHeat: 0, correctBets: 0, busts: 0 };
      return {
        ...p,
        passiveShields: usePassive ? p.passiveShields - 1 : p.passiveShields,
        stats: {
          ...oldStats,
          maxHeat: Math.max(oldStats.maxHeat, 0),
        },
      };
    }
    return p;
  });

  // Roll secret bowls
  const secretBowls = shuffleBowls(rng);

  return {
    ...s,
    players,
    phase: "active",
    heat: 0,
    shieldUsed: !usePassive,
    passiveShieldActivated: false,
    feedback: "",
    secretBowls,
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

  // Correct → win stake × payout (bust pays more); wrong → lose the stake.
  const wagerDelta = (w: Wager, correct: boolean) =>
    correct ? w.amount * (w.bet === "bust" ? BET.payoutBust : BET.payoutAman) : -w.amount;

  const betResults: BetResult[] = Object.entries(s.bets)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const player = Number(k);
      const w = v!;
      const correct = (busted && w.bet === "bust") || (!busted && w.bet === "aman");
      return { player, name: s.players[player].name, bet: w.bet, amount: w.amount, correct, delta: wagerDelta(w, correct) };
    });

    const players = s.players.map((p, i) => {
      let score = p.score;
      if (i === pIdx && !busted) score += gained;
      const w = s.bets[i];
      let correctBet = false;
      if (w) {
        const correct = (busted && w.bet === "bust") || (!busted && w.bet === "aman");
        score += wagerDelta(w, correct);
        if (correct) correctBet = true;
      }
      
      const oldStats = p.stats ?? { ijoCount: 0, rawitCount: 0, carolinaCount: 0, maxHeat: 0, correctBets: 0, busts: 0 };
      const newStats = {
        ...oldStats,
        correctBets: oldStats.correctBets + (correctBet ? 1 : 0),
      };
      
      return { ...p, score: Math.max(0, score), stats: newStats };
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
              susu: startingSusu(action.char),
              terawangCharges: startingTerawang(action.char),
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
      const cap = Math.min(state.players[action.player]?.score ?? 0, BET.maxWager);
      if (cap <= 0) return state; // no points → can't wager
      // tapping the current side again clears the bet
      if (cur && cur.bet === action.bet) {
        return { ...state, bets: { ...state.bets, [action.player]: undefined } };
      }
      const amount = cur ? Math.min(cur.amount, cap) : Math.min(BET.defaultWager, cap);
      return { ...state, bets: { ...state.bets, [action.player]: { bet: action.bet, amount } } };
    }
    case "SET_BET_AMOUNT": {
      const cur = state.bets[action.player];
      if (!cur) return state;
      const cap = Math.min(state.players[action.player]?.score ?? 0, BET.maxWager);
      const amount = Math.max(1, Math.min(action.amount, cap));
      return { ...state, bets: { ...state.bets, [action.player]: { ...cur, amount } } };
    }
    case "TOGGLE_PASSIVE_SHIELD": {
      const pIdx = activeIndex(state);
      const me = state.players[pIdx];
      if (me.char !== "baja" || me.passiveShields <= 0) return state;
      return {
        ...state,
        passiveShieldActivated: !state.passiveShieldActivated,
      };
    }
    case "TERAWANG": {
      const pIdx = activeIndex(state);
      const me = state.players[pIdx];
      if (me.char !== "terawang" || me.terawangCharges <= 0 || state.terawangActive) return state;
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === pIdx ? { ...p, terawangCharges: p.terawangCharges - 1 } : p
        ),
        terawangActive: true,
        terawangUsed: true,
        feedback: "Mata batin terbuka! Isi mangkok terlihat.",
      };
    }
    case "CONFIRM_PRETURN": {
      return startActive(state, rng);
    }
    case "SUAP": {
        const pIdx = activeIndex(state);
        const me = state.players[pIdx];
        const ch = me.char;
        const bowlIdx = action.bowlIdx;
        const bite = state.secretBowls[bowlIdx];
        if (!bite) return state; // Safety guard

        const s = { ...state, terawangActive: false };

        const newHeat = s.heat + biteHeat(bite, ch);
        
        const oldStats = me.stats ?? { ijoCount: 0, rawitCount: 0, carolinaCount: 0, maxHeat: 0, correctBets: 0, busts: 0 };
        const newStats = {
          ...oldStats,
          ijoCount: oldStats.ijoCount + (bite === "ijo" ? 1 : 0),
          rawitCount: oldStats.rawitCount + (bite === "rawit" ? 1 : 0),
          carolinaCount: oldStats.carolinaCount + (bite === "carolina" ? 1 : 0),
          maxHeat: Math.max(oldStats.maxHeat, newHeat),
        };

        // Shuffle the bowls completely
        const nextSecretBowls = shuffleBowls(rng);

        if (rollBust(newHeat, rng)) {
          if (!s.shieldUsed && surviveBusts(ch) > 0) {
            const gain = biteGain(bite, ch, rng);
            return {
              ...s,
              players: s.players.map((p, i) => (i === pIdx ? { ...p, stats: newStats } : p)),
              heat: newHeat,
              roundPts: s.roundPts + gain,
              shieldUsed: true,
              feedback: `Perut baja nahan! Selamat sekali. (+${gain} poin)`,
              secretBowls: nextSecretBowls,
            };
          }
          const bustStats = { ...newStats, busts: newStats.busts + 1 };
          return resolve(
            {
              ...s,
              heat: newHeat,
              players: s.players.map((p, i) => (i === pIdx ? { ...p, stats: bustStats } : p)),
              secretBowls: nextSecretBowls,
            },
            true,
            0,
            { raw: 0, mult: 1, hematBonus: 0, final: isFinalRonde(s) }
          );
        }
        const gain = biteGain(bite, ch, rng);
        return {
          ...s,
          players: s.players.map((p, i) => (i === pIdx ? { ...p, stats: newStats } : p)),
          heat: newHeat,
          roundPts: s.roundPts + gain,
          feedback: `Nyam ${BITES[bite].name}! +${gain} poin`,
          secretBowls: nextSecretBowls,
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
      const b = scoreBank(state.roundPts, state.heat, me.char, isFinalRonde(state), state.terawangUsed);
      return resolve(state, false, b.gained, b);
    }

    // ── result → next, or time-out skip ──
    case "NEXT":
      return advanceTurn(state);
    case "SKIP_TURN": {
      // ran out of time: if they have points, auto-bank them; otherwise forfeit.
      if (state.roundPts > 0) {
        const me = state.players[activeIndex(state)];
        const b = scoreBank(state.roundPts, state.heat, me.char, isFinalRonde(state), state.terawangUsed);
        return resolve(
          { ...state, feedback: "Waktu habis! Poin disajikan otomatis." },
          false,
          b.gained,
          b
        );
      }
      return advanceTurn({ ...state, feedback: "Kehabisan waktu!" });
    }

    // ── shop (between rondes) ──
    case "BUY": {
      const price = SHOP[action.item];
      const buyer = state.players[action.player];
      if (!buyer || buyer.score < price) return state;
      const field: Record<ShopItem, keyof Player> = { susu: "susu" };
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
    case "SET_BET_AMOUNT":
      return a.player === seat && a.player !== activeIndex(state);
    case "CONFIRM_PRETURN":
    case "SUAP":
    case "MINUM_SUSU":
    case "SAJIKAN":
    case "NEXT":
    case "SKIP_TURN":
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
