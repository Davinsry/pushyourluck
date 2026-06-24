// ─────────────────────────────────────────────────────────────
//  BALANCE — the ONLY file you edit to tune the game.
//  Every gameplay number (and the per-character/​per-chili copy
//  that goes with it) lives here. Nothing else hard-codes a number.
// ─────────────────────────────────────────────────────────────

export const CYCLES = 4; // rondes (turns) each player gets
export const STARTING_SCORE = 0; // points each player starts with (earn by playing)
export const TURN_SECONDS = 60; // per-turn time limit; running out skips the turn

// Shop (opens after each ronde) — prices in points. "cabai" = a sabotage token.
export const SHOP = { susu: 8, tameng: 10, cabai: 6 } as const;
export const SABOTAGE_HEAT = 15; // +heat per spectator "tambah sambal"
export const TAMENG_BLOCK = 15; // 1 tameng blocks exactly 15 heat (1 sabotage)
export const SABOTAGE_MAX_PER_TARGET = 45; // max total queued heat onto 1 player (0 = unlimited)
export const BLOCK_BET_AND_SABO = true; // prevent betting "bust" and sabotaging the same player
export const SUSU_COOL = 25; // heat removed by drinking susu
export const BET_STAKE = 5; // spectator bet payout: correct +5, wrong −5
export const FINAL_MULT = 2; // score multiplier on the final (pamungkas) ronde

/** bustChance% = clamp(heat - offset, 0, cap) */
export const BUST = { offset: 0, cap: 100 } as const;

/** heat thresholds for the Level Berani multiplier (×1.5 / ×2) */
export const MULT = { t15: 50, t2: 80 } as const;

/** Bonus for Si Hemat when banking below the safe heat threshold. */
export const HEMAT = { bonus: 14, below: 45 } as const;

// ── Chilis (bites) ──────────────────────────────────────────
// points: [min, max] inclusive roll. heat: heat added per bite.
// colorKey: token from the palette (see src/index.css / tailwind config).
export const BITES = {
  ijo: { name: "Cabe Ijo", points: [4, 7], heat: 8, colorKey: "leaf" },
  rawit: { name: "Cabe Rawit", points: [8, 12], heat: 15, colorKey: "flame" },
  carolina: { name: "Cabe Carolina", points: [15, 22], heat: 28, colorKey: "chili-dark" },
} as const;

// ── Characters (sidegrades: one upside + one downside) ───────
// Mechanic fields are read by the rules engine; tag/up/down are UI copy.
//   surviveBust : free busts survived per ronde (Lidah Baja)
//   pointMod    : flat points added/removed per bite
//   heatMod     : extra heat added per bite
//   sabotage    : starting "tambah sambal" tokens
//   maxMult     : caps the Level Berani multiplier
//   safeBonus / safeBelow : flat bonus when banking under a heat threshold
export const CHARS = {
  baja: {
    name: "Si Lidah Baja",
    tag: "Tahan banting",
    colorKey: "steel",
    up: "Punya 2 tameng kebal kepedasan per game, diaktifkan sebelum makan.",
    down: "Poin dikurangi sesuai cabai (Carolina −3, Rawit −2, Ijo −1).",
    surviveBust: 1,
    pointModPerChili: { ijo: -1, rawit: -2, carolina: -3 } as const,
  },
  rakus: {
    name: "Si Rakus",
    tag: "High-roller",
    colorKey: "chili",
    up: "Poin ekstra per cabai (Carolina +6, Rawit +3, Ijo +1).",
    down: "Pedas naik lebih cepat (Carolina +10, Rawit +5, Ijo +2).",
    pointModPerChili: { ijo: 1, rawit: 3, carolina: 6 } as const,
    heatModPerChili: { ijo: 2, rawit: 5, carolina: 10 } as const,
  },
  kompor: {
    name: "Si Tukang Kompor",
    tag: "Pengganggu",
    colorKey: "flame",
    up: "Mulai dengan 3 jatah Sabotase (karakter lain 1) untuk menjebak mangkok lawan dengan Cabe Carolina.",
    down: "Pengali skor mentok ×1.5.",
    sabotage: 3,
    maxMult: 1.5,
  },
  hemat: {
    name: "Si Hemat",
    tag: "Grinder",
    colorKey: "leaf",
    up: "Sajikan saat pedas < 45 → bonus +14.",
    down: "Pengali skor mentok ×1.5.",
    safeBonus: HEMAT.bonus,
    safeBelow: HEMAT.below,
    maxMult: 1.5,
  },
  perisai: {
    name: "Si Perisai",
    tag: "Tahan serangan",
    colorKey: "amber",
    up: "Mulai dengan 2 tameng (karakter lain 1) untuk mengintip isi mangkok tersembunyi.",
    down: "Poin tiap suap −2.",
    tameng: 2,
    pointMod: -2,
  },
  pendingin: {
    name: "Si Pendingin",
    tag: "Adem",
    colorKey: "leaf-dark",
    up: "Mulai dengan 2 susu.",
    down: "Pedas naik +2 tiap suap.",
    susu: 2,
    heatMod: 2,
  },
} as const;

// Default starting kit for every player (characters can override per-field).
export const STARTING_KIT = { tameng: 1, susu: 1, sabotage: 1 } as const;

// How long the eat/drink hand animation runs (ms). Controls also stay locked
// for this long so a player can't spam actions mid-animation.
export const ACTION_ANIM_MS = 750;

// ── Bot (solo mode) behaviour — all tunable. ────────────────
export const BOT = {
  bankAtBust: 50, // bank once bust chance ≥ this %
  drinkAtHeat: 55, // drink susu when heat ≥ this (if any left)
  carolinaBelowHeat: 22, // only grab Carolina when heat is below this
  rawitBelowHeat: 45, // grab Rawit below this, otherwise play safe (Ijo)
  sabotageChance: 0.5, // chance a bot spectator spends a sabotage token
  betBustBias: 0.45, // P(bot bets "kepedesan"); else "aman"
  stepDelayMs: 850, // pause between bot actions so you can watch
} as const;
