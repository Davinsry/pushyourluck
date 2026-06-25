// ─────────────────────────────────────────────────────────────
//  Bot brains for solo mode. Pure functions: given the state they
//  return the Action a bot would take. Driven on a timer in App so
//  the moves are watchable. All thresholds live in balance BOT{}.
// ─────────────────────────────────────────────────────────────
import { BOT } from "../config/balance";
import type { Action, GameState, Rng } from "./types";
import { bustChance, multiplier } from "./rules";
import { activeIndex, isFinalRonde } from "./reducer";

// ── Helpers ──────────────────────────────────────────────────

/** The leading score among opponents. */
function topOpponentScore(state: GameState, myIdx: number): number {
  return Math.max(...state.players.filter((_, i) => i !== myIdx).map((p) => p.score));
}

/** What a bot active player does next: drink, eat, or bank. */
export function botActiveDecision(state: GameState): Action {
  const idx = activeIndex(state);
  const me = state.players[idx];
  const heat = state.heat;
  const chance = bustChance(heat);
  const pts = state.roundPts;
  const ch = me.char;
  const final = isFinalRonde(state);

  // Score gap: how far behind (positive) or ahead (negative) the bot is
  const topOpp = topOpponentScore(state, idx);
  const scoreDiff = topOpp - me.score; // positive = behind

  // ── Adaptive bank threshold ──
  // Base: bank at 45% bust chance. But adjust:
  //  - If behind by a lot → push harder (raise threshold up to 70%)
  //  - If ahead → play safe (lower threshold to 35%)
  //  - Final ronde → push a bit harder (points are doubled)
  let bankThreshold: number = BOT.bankAtBust;
  if (scoreDiff > 20) bankThreshold += 15; // way behind: gamble more
  else if (scoreDiff > 10) bankThreshold += 8;
  else if (scoreDiff < -15) bankThreshold -= 12; // way ahead: play safe
  else if (scoreDiff < -5) bankThreshold -= 5;
  if (final) bankThreshold += 8; // final ronde: push harder for 2x

  // Clamp to sensible range
  bankThreshold = Math.max(30, Math.min(75, bankThreshold));

  // ── Multiplier awareness: don't bank at ×1 if close to ×1.5 threshold ──
  const mult = multiplier(heat, ch);
  const wantsHigherMult = mult < 1.5 && heat >= 35 && heat < 50 && pts >= 8;

  // ── Drink susu strategically ──
  if (heat >= BOT.drinkAtHeat && me.susu > 0 && pts >= 6) {
    if (chance < bankThreshold + 15) {
      return { type: "MINUM_SUSU" };
    }
  }
  if (chance >= 60 && me.susu > 0 && pts >= 10) {
    return { type: "MINUM_SUSU" };
  }

  // ── Bank decision ──
  if (pts > 0 && chance >= bankThreshold && !wantsHigherMult) {
    return { type: "SAJIKAN" };
  }

  // Choice which bowl to eat (SUAP) - pure blind choice, let's alternate/cycle based on heat or turn
  const bowlIdx = (state.turn + heat) % 3;
  return { type: "SUAP", bowlIdx };
}

/** Legacy block decision, returns fallback CONFIRM_PRETURN. */
export function botBlockDecision(state: GameState): Action {
  void state;
  return { type: "CONFIRM_PRETURN" };
}

/**
 * One-shot spectator moves for every bot that isn't the active player:
 * a bet, and maybe a sabotage. Returns a batch of actions to dispatch.
 */
export function botSpectatorActions(state: GameState, rng: Rng): Action[] {
  const active = activeIndex(state);
  const activePlayer = state.players[active];
  const actions: Action[] = [];

  state.players.forEach((p, k) => {
    if (k === active || !p.isBot) return;

    // ── Smarter betting ──
    if (!state.bets[k]) {
      let bustBias: number = BOT.betBustBias;
      if (activePlayer.char === "rakus") bustBias += 0.15;
      if (activePlayer.char === "kompor") bustBias += 0.1;
      if (activePlayer.char === "baja") bustBias -= 0.15;
      if (activePlayer.char === "hemat") bustBias -= 0.1;
      if (activePlayer.char === "pendingin") bustBias -= 0.1;

      actions.push({ type: "TOGGLE_BET", player: k, bet: rng() < bustBias ? "bust" : "aman" });
    }

    // ── Sabotage Traps ──
    // Sabotage trapping removed
  });
  return actions;
}

