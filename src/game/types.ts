import { BITES, CHARS } from "../config/balance";

export type CharacterId = keyof typeof CHARS;
export type BiteId = keyof typeof BITES;

export type Screen =
  | "intro"
  | "menu"
  | "settings"
  | "tutorial"
  | "setup"
  | "draft"
  | "play"
  | "shop"
  | "gameover";

/** Buyable shop items (cabai = a sabotage / "tambah sambal" token). */
export type ShopItem = "susu" | "tameng" | "cabai";
export type Phase = "preturn" | "active" | "result";

/** solo = 1 human vs bots; local = pass-and-play, all human. */
export type Mode = "solo" | "local";

/** A spectator's wager on the active player's outcome. */
export type Bet = "aman" | "bust";

/** bets keyed by player index → their wager (undefined = no bet). */
export type BetMap = Record<number, Bet | undefined>;

export interface Player {
  name: string;
  score: number;
  char: CharacterId | null;
  sabotage: number; // remaining "tambah sambal" tokens
  tameng: number; // remaining shields
  susu: number; // remaining milk
  isBot: boolean; // controlled by the AI (solo mode)
}

/** Per-spectator settlement line shown on the result screen. */
export interface BetResult {
  player: number;
  name: string;
  bet: Bet;
  correct: boolean;
  delta: number;
}

/** Everything needed to render the result phase. */
export interface Outcome {
  busted: boolean;
  gained: number;
  raw: number; // raw round points before multipliers
  mult: number; // Level Berani multiplier applied
  hematBonus: number;
  final: boolean; // was this the pamungkas ronde?
  bets: BetResult[];
}

export interface Settings {
  cycles: number; // rondes per player (defaults to balance CYCLES)
  shop: boolean; // open the shop between rondes (off for online)
  turnTimerLimit?: number; // turn timer limit in seconds (0 = unlimited)
}

export interface GameState {
  screen: Screen;
  mode: Mode;
  settings: Settings;
  players: Player[];

  // draft (free pick — all remaining characters)
  draftIdx: number;
  draftOpts: CharacterId[];

  // turn bookkeeping
  turn: number; // 0-based global turn counter
  phase: Phase;
  heat: number;
  roundPts: number;
  shieldUsed: boolean; // Lidah Baja's free-survival used this ronde
  feedback: string;
  outcome: Outcome | null;

  // preturn (spectator) phase
  pendingHeat: number; // sabotage heat queued onto the active player
  usedSabo: number[]; // spectator indices who already sabotaged
  bets: BetMap;
  blockAsk: boolean; // showing the "use your tameng?" prompt
}

export type Action =
  | { type: "GO_MENU" }
  | { type: "OPEN_SETTINGS" }
  | { type: "OPEN_TUTORIAL" }
  | { type: "SET_CYCLES"; cycles: number }
  | { type: "START_MODE"; mode: Mode }
  | { type: "SET_COUNT"; count: number }
  | { type: "RENAME"; index: number; name: string }
  | { type: "START_DRAFT" }
  | { type: "CHOOSE_CHAR"; char: CharacterId }
  | { type: "TOGGLE_BET"; player: number; bet: Bet }
  | { type: "ADD_SABO"; player: number }
  | { type: "CONFIRM_PRETURN" }
  | { type: "USE_TAMENG"; count: number } // block sabotage with a shield
  | { type: "ACCEPT_HEAT" } // take the sabotage heat as-is
  | { type: "SUAP"; bite: BiteId }
  | { type: "MINUM_SUSU" }
  | { type: "SAJIKAN" }
  | { type: "SKIP_TURN" } // ran out of time → forfeit the round, next player
  | { type: "NEXT" }
  | { type: "BUY"; player: number; item: ShopItem }
  | { type: "CLOSE_SHOP" }
  | { type: "RESTART" } // replay with the same names/mode/settings
  | { type: "RESET" };

/** Random source — injectable so the reducer stays deterministic in tests. */
export type Rng = () => number;
