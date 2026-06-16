// ─────────────────────────────────────────────────────────────
//  Bot brains for solo mode. Pure functions: given the state they
//  return the Action a bot would take. Driven on a timer in App so
//  the moves are watchable. All thresholds live in balance BOT{}.
// ─────────────────────────────────────────────────────────────
import { BOT, SABOTAGE_HEAT } from "../config/balance";
import type { Action, BiteId, GameState, Rng } from "./types";
import { bustChance } from "./rules";
import { activeIndex } from "./reducer";

/** What a bot active player does next: drink, eat, or bank. */
export function botActiveDecision(state: GameState): Action {
  const me = state.players[activeIndex(state)];
  const heat = state.heat;

  // Bank once we have something and the risk is high enough.
  if (state.roundPts > 0 && bustChance(heat) >= BOT.bankAtBust) {
    return { type: "SAJIKAN" };
  }
  // Cool down when scalding and milk is available.
  if (heat >= BOT.drinkAtHeat && me.susu > 0) {
    return { type: "MINUM_SUSU" };
  }
  // Otherwise eat — bolder chili while still cool, safer as it heats up.
  let bite: BiteId = "ijo";
  if (heat < BOT.carolinaBelowHeat) bite = "carolina";
  else if (heat < BOT.rawitBelowHeat) bite = "rawit";
  return { type: "SUAP", bite };
}

/** When sabotaged, a bot blocks with a shield only if the heat is meaningful. */
export function botBlockDecision(state: GameState): Action {
  return state.pendingHeat >= SABOTAGE_HEAT * 2 ? { type: "USE_TAMENG" } : { type: "ACCEPT_HEAT" };
}

/**
 * One-shot spectator moves for every bot that isn't the active player:
 * a bet, and maybe a sabotage. Returns a batch of actions to dispatch.
 */
export function botSpectatorActions(state: GameState, rng: Rng): Action[] {
  const active = activeIndex(state);
  const actions: Action[] = [];
  state.players.forEach((p, k) => {
    if (k === active || !p.isBot) return;
    if (!state.bets[k]) {
      actions.push({ type: "TOGGLE_BET", player: k, bet: rng() < BOT.betBustBias ? "bust" : "aman" });
    }
    if (p.sabotage > 0 && !state.usedSabo.includes(k) && rng() < BOT.sabotageChance) {
      actions.push({ type: "ADD_SABO", player: k });
    }
  });
  return actions;
}
