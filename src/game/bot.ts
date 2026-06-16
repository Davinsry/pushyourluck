// ─────────────────────────────────────────────────────────────
//  Bot brains for solo mode. Pure functions: given the state they
//  return the Action a bot would take. Driven on a timer in App so
//  the moves are watchable. All thresholds live in balance BOT{}.
// ─────────────────────────────────────────────────────────────
import { BOT, SABOTAGE_HEAT } from "../config/balance";
import type { Action, BiteId, GameState, Rng } from "./types";
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
  // Drink when heat is high enough to be dangerous but we still want to keep eating
  if (heat >= BOT.drinkAtHeat && me.susu > 0 && pts >= 6) {
    // Don't waste susu if we're about to bank anyway
    if (chance < bankThreshold + 15) {
      return { type: "MINUM_SUSU" };
    }
  }
  // Emergency drink: about to bust and have points worth saving
  if (chance >= 60 && me.susu > 0 && pts >= 10) {
    return { type: "MINUM_SUSU" };
  }

  // ── Bank decision ──
  if (pts > 0 && chance >= bankThreshold && !wantsHigherMult) {
    return { type: "SAJIKAN" };
  }

  // ── Chili selection (smarter risk-reward) ──
  // Consider expected value: points vs heat added
  let bite: BiteId = "ijo";

  if (heat < 15) {
    // Very safe: go big
    bite = "carolina";
  } else if (heat < 30) {
    // Moderate: mix it up based on situation
    if (scoreDiff > 10 || final) bite = "carolina"; // behind or final: aggressive
    else bite = "rawit";
  } else if (heat < 50) {
    // Getting warm: be more careful
    if (scoreDiff > 15) bite = "rawit"; // still behind: medium risk
    else bite = chance < 25 ? "rawit" : "ijo";
  } else {
    // Hot: play safe unless desperate
    if (scoreDiff > 25 && chance < 55) bite = "rawit";
    else bite = "ijo";
  }

  // Character-specific overrides
  if (ch === "baja" && !state.shieldUsed && chance >= 30) {
    // Lidah Baja has a free survive — be bolder
    bite = heat < 40 ? "carolina" : "rawit";
  }
  if (ch === "hemat" && heat < 35) {
    // Si Hemat wants to bank below 40 heat for bonus — eat safe chilis
    bite = "ijo";
  }
  if (ch === "rakus") {
    // Si Rakus gets +3 per bite, so even ijo is decent. Push a bit more.
    if (heat < 35) bite = heat < 20 ? "carolina" : "rawit";
  }

  return { type: "SUAP", bite };
}

/** When sabotaged, a bot blocks with a shield based on how much heat is incoming. */
export function botBlockDecision(state: GameState): Action {
  // Block if the sabotage heat is significant, or if we're already hot
  const wouldBeHot = state.heat + state.pendingHeat;
  if (state.pendingHeat >= SABOTAGE_HEAT && (wouldBeHot > 45 || bustChance(wouldBeHot) > 35)) {
    return { type: "USE_TAMENG" };
  }
  return { type: "ACCEPT_HEAT" };
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

    // ── Smarter betting: consider the active player's character ──
    if (!state.bets[k]) {
      let bustBias: number = BOT.betBustBias;
      // Characters that tend to bust more (rakus, kompor) → bet bust more
      if (activePlayer.char === "rakus") bustBias += 0.15;
      if (activePlayer.char === "kompor") bustBias += 0.1;
      // Safe characters → lean toward "aman"
      if (activePlayer.char === "baja") bustBias -= 0.15;
      if (activePlayer.char === "hemat") bustBias -= 0.1;
      if (activePlayer.char === "pendingin") bustBias -= 0.1;

      actions.push({ type: "TOGGLE_BET", player: k, bet: rng() < bustBias ? "bust" : "aman" });
    }

    // ── Sabotage: more aggressive when the active player is a threat ──
    if (p.sabotage > 0 && !state.usedSabo.includes(k)) {
      let saboChance: number = BOT.sabotageChance;
      // Sabotage more if active player is leading
      if (activePlayer.score > p.score + 10) saboChance += 0.2;
      // Save sabotage if it's early and not threatened
      if (activePlayer.score < p.score - 10) saboChance -= 0.15;
      saboChance = Math.max(0.1, Math.min(0.9, saboChance));

      if (rng() < saboChance) {
        actions.push({ type: "ADD_SABO", player: k });
      }
    }
  });
  return actions;
}

