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
  let heatMod = 0;
  if (char) {
    const charDef = CHARS[char] as any;
    if (charDef.heatModPerChili && bite in charDef.heatModPerChili) {
      heatMod = charDef.heatModPerChili[bite];
    } else {
      heatMod = charDef.heatMod ?? 0;
    }
  }
  return BITES[bite].heat + heatMod;
}

/** Points gained from a successful bite (rolls within range, applies char mod). */
export function biteGain(bite: BiteId, char: CharacterId | null, rng: Rng): number {
  const [min, max] = BITES[bite].points;
  let pointMod = 0;
  if (char) {
    const charDef = CHARS[char] as any;
    if (charDef.pointModPerChili && bite in charDef.pointModPerChili) {
      pointMod = charDef.pointModPerChili[bite];
    } else {
      pointMod = charDef.pointMod ?? 0;
    }
  }
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
    stats: {
      ijoCount: 0,
      rawitCount: 0,
      carolinaCount: 0,
      maxHeat: 0,
      correctBets: 0,
      busts: 0,
    },
  };
}

export interface Playstyle {
  title: string;
  description: string;
}

export function analyzePlaystyle(stats: {
  ijoCount: number;
  rawitCount: number;
  carolinaCount: number;
  maxHeat: number;
  correctBets: number;
  busts: number;
}): Playstyle {
  const { ijoCount, rawitCount, carolinaCount, correctBets, busts } = stats;
  const totalEaten = ijoCount + rawitCount + carolinaCount;

  if (busts >= 2) {
    return {
      title: "Korban Kepedesan",
      description: "Nafsu makan terlalu besar sampai sering tersedak/bust!",
    };
  }
  if (correctBets >= 2 && correctBets > totalEaten) {
    return {
      title: "Pengamat Ulung",
      description: "Lebih jago menebak nasib lawan dibanding makan sendiri.",
    };
  }
  if (carolinaCount > ijoCount && carolinaCount > rawitCount) {
    return {
      title: "Carolina Lover",
      description: "Menyukai tantangan ekstrem dengan lahap melahap Cabe Carolina!",
    };
  }
  if (rawitCount > ijoCount && rawitCount >= carolinaCount) {
    return {
      title: "Rawit Taktis",
      description: "Strategis, mengambil risiko sedang demi poin maksimal.",
    };
  }
  if (ijoCount > rawitCount && ijoCount >= carolinaCount) {
    return {
      title: "Cabe Ijo Lover",
      description: "Sangat berhati-hati, bermain aman demi kelangsungan hidup.",
    };
  }
  return {
    title: "Pemain Taktis",
    description: "Keseimbangan yang baik antara risiko dan hasil.",
  };
}

export interface PlaytestingStats {
  favoriteChili: string;
  spiciestKing: { name: string; value: number };
  bestGuesser: { name: string; value: number };
  mostBusted: { name: string; value: number };
}

export function calculatePlaytestingStats(players: Player[]): PlaytestingStats {
  let totalIjo = 0;
  let totalRawit = 0;
  let totalCarolina = 0;

  let maxHeatVal = -1;
  let maxHeatPlayer = "-";

  let maxBetsVal = -1;
  let maxBetsPlayer = "-";

  let maxBustsVal = -1;
  let maxBustsPlayer = "-";

  players.forEach((p) => {
    const s = p.stats ?? { ijoCount: 0, rawitCount: 0, carolinaCount: 0, maxHeat: 0, correctBets: 0, busts: 0 };
    totalIjo += s.ijoCount;
    totalRawit += s.rawitCount;
    totalCarolina += s.carolinaCount;

    if (s.maxHeat > maxHeatVal) {
      maxHeatVal = s.maxHeat;
      maxHeatPlayer = p.name;
    }
    if (s.correctBets > maxBetsVal) {
      maxBetsVal = s.correctBets;
      maxBetsPlayer = p.name;
    }
    if (s.busts > maxBustsVal) {
      maxBustsVal = s.busts;
      maxBustsPlayer = p.name;
    }
  });

  // Favorite Chili
  let favoriteChili = "Belum ada";
  const maxChiliCount = Math.max(totalIjo, totalRawit, totalCarolina);
  if (maxChiliCount > 0) {
    if (maxChiliCount === totalCarolina) {
      favoriteChili = "Cabe Carolina";
    } else if (maxChiliCount === totalRawit) {
      favoriteChili = "Cabe Rawit";
    } else {
      favoriteChili = "Cabe Ijo";
    }
  }

  return {
    favoriteChili,
    spiciestKing: maxHeatVal > 0 ? { name: maxHeatPlayer, value: maxHeatVal } : { name: "-", value: 0 },
    bestGuesser: maxBetsVal > 0 ? { name: maxBetsPlayer, value: maxBetsVal } : { name: "-", value: 0 },
    mostBusted: maxBustsVal > 0 ? { name: maxBustsPlayer, value: maxBustsVal } : { name: "-", value: 0 },
  };
}
