// ─────────────────────────────────────────────────────────────
//  Pure game maths. No React, no state — every function here is
//  deterministic given its arguments (rng is passed in), so they
//  are trivially unit-testable. See src/game/rules.test.ts.
// ─────────────────────────────────────────────────────────────
import { BITES, BUST, CHARS, FINAL_MULT, MULT, STARTING_KIT, STARTING_SCORE } from "../config/balance";
import type { BiteId, CharacterId, Player, Rng } from "./types";

/** Inclusive integer in [a, b]. */
export function randRange(a: number, b: number, rng: Rng): number {
  return a + Math.floor(rng() * (b - a + 1));
}

/** Bust probability (%) at a given heat. */
export function bustChance(heat: number): number {
  return Math.min(BUST.cap, Math.max(0, Math.round(heat - BUST.offset)));
}

/** Level Berani multiplier for a given heat + character (some chars cap it). */
export function multiplier(heat: number, char: CharacterId | null): number {
  let m = heat >= MULT.t2 ? 2 : heat >= MULT.t15 ? 1.5 : 1;
  const cap = char ? (CHARS[char] as { maxMult?: number }).maxMult : undefined;
  if (cap !== undefined && m > cap) m = cap;
  return m;
}

/** Extra heat a bite adds for this character. */
export function biteHeat(bite: BiteId, char: CharacterId | null): number {
  const heatMod = char ? (CHARS[char] as { heatMod?: number }).heatMod ?? 0 : 0;
  return BITES[bite].heat + heatMod;
}

/** Points gained from a successful bite (rolls within range, applies char mod). */
export function biteGain(bite: BiteId, char: CharacterId | null, rng: Rng): number {
  const [min, max] = BITES[bite].points;
  const pointMod = char ? (CHARS[char] as { pointMod?: number }).pointMod ?? 0 : 0;
  return Math.max(1, randRange(min, max, rng) + pointMod);
}

/** Did the eater bust at this heat? (rng roll vs. bustChance) */
export function rollBust(heat: number, rng: Rng): boolean {
  return rng() * 100 < bustChance(heat);
}

export interface ScoreBreakdown {
  raw: number;
  mult: number;
  hematBonus: number;
  final: boolean;
  gained: number;
}

/** Final banked score for a round (handles multiplier, hemat bonus, pamungkas). */
export function scoreBank(
  roundPts: number,
  heat: number,
  char: CharacterId | null,
  isFinal: boolean
): ScoreBreakdown {
  const mult = multiplier(heat, char);
  const charDef = char ? (CHARS[char] as { safeBonus?: number; safeBelow?: number }) : null;
  const hematBonus =
    charDef?.safeBonus !== undefined && charDef.safeBelow !== undefined && heat < charDef.safeBelow
      ? charDef.safeBonus
      : 0;
  let gained = Math.round(roundPts * mult) + hematBonus;
  if (isFinal) gained *= FINAL_MULT;
  return { raw: roundPts, mult, hematBonus, final: isFinal, gained };
}

/** How many free busts this character survives per ronde. */
export function surviveBusts(char: CharacterId | null): number {
  return char ? (CHARS[char] as { surviveBust?: number }).surviveBust ?? 0 : 0;
}

/** Starting sabotage tokens for a character. */
export function startingSabotage(char: CharacterId | null): number {
  return char ? (CHARS[char] as { sabotage?: number }).sabotage ?? STARTING_KIT.sabotage : STARTING_KIT.sabotage;
}

/** Starting shields for a character. */
export function startingTameng(char: CharacterId | null): number {
  return char ? (CHARS[char] as { tameng?: number }).tameng ?? STARTING_KIT.tameng : STARTING_KIT.tameng;
}

/** Starting milk for a character. */
export function startingSusu(char: CharacterId | null): number {
  return char ? (CHARS[char] as { susu?: number }).susu ?? STARTING_KIT.susu : STARTING_KIT.susu;
}

/**
 * Characters still available to draft (all not yet taken). Free pick from 6 —
 * each player must end up with a different character.
 */
export function draftOptions(taken: CharacterId[] = []): CharacterId[] {
  return (Object.keys(CHARS) as CharacterId[]).filter((k) => !taken.includes(k));
}

/** A fresh player with the default kit and starting points. */
export function makePlayer(index: number, name?: string, isBot = false): Player {
  return {
    name: name ?? `Pemain ${index + 1}`,
    score: STARTING_SCORE,
    char: null,
    sabotage: STARTING_KIT.sabotage,
    tameng: STARTING_KIT.tameng,
    susu: STARTING_KIT.susu,
    isBot,
  };
}
