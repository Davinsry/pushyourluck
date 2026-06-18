import { describe, expect, it } from "vitest";
import { BET_STAKE, SABOTAGE_HEAT, STARTING_SCORE, SUSU_COOL, TAMENG_BLOCK_PER_PLAYER } from "../config/balance";
import { gameReducer, initialState, type GameState } from "./index";
import type { Action, Rng } from "./types";

// Deterministic rng returning the given values in order, looping.
const seq = (values: number[]): Rng => {
  let i = 0;
  return () => values[i++ % values.length];
};

// rollBust busts when rng()*100 < bustChance, so a high roll is always safe
// (bustChance caps below 100). A 0 roll busts whenever bustChance > 0.
const SAFE: Rng = () => 0.999; // never busts; also yields max point rolls
const BUST_ROLL: Rng = () => 0; // busts whenever heat is above the offset

const run = (state: GameState, actions: Action[], rng: Rng) =>
  actions.reduce((s, a) => gameReducer(s, a, rng), state);

const startedGame = (): GameState =>
  run(initialState(seq([0, 0])), [
    { type: "SET_COUNT", count: 2 },
    { type: "START_DRAFT" },
    { type: "CHOOSE_CHAR", char: "rakus" },
    { type: "CHOOSE_CHAR", char: "rakus" },
  ], seq([0, 0]));

describe("setup → draft → play", () => {
  it("reaches the play screen with both characters chosen", () => {
    const s = startedGame();
    expect(s.screen).toBe("play");
    expect(s.players.every((p) => p.char === "rakus")).toBe(true);
    expect(s.phase).toBe("preturn");
  });
});

describe("sabotage and shielding", () => {
  it("queues heat then blocks part of it with a tameng (scales with player count)", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "ADD_SABO", player: 1 }, SAFE);
    expect(s.pendingHeat).toBe(SABOTAGE_HEAT);
    expect(s.players[1].sabotage).toBe(0);
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    expect(s.blockAsk).toBe(true);
    s = gameReducer(s, { type: "USE_TAMENG" }, SAFE);
    expect(s.phase).toBe("active");
    // 2 players → block 2 × TAMENG_BLOCK_PER_PLAYER; leftover heat still applies
    const block = s.players.length * TAMENG_BLOCK_PER_PLAYER;
    expect(s.heat).toBe(Math.max(0, SABOTAGE_HEAT - block));
    expect(s.players[0].tameng).toBe(0);
  });
});

describe("eating and banking", () => {
  it("accrues points on a safe bite and banks them", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s = gameReducer(s, { type: "SUAP", bite: "ijo" }, SAFE);
    expect(s.roundPts).toBeGreaterThan(0);
    s = gameReducer(s, { type: "SAJIKAN" }, SAFE);
    expect(s.phase).toBe("result");
    expect(s.outcome?.busted).toBe(false);
    expect(s.players[0].score).toBe(STARTING_SCORE + s.outcome!.gained);
  });
});

describe("spectator bets settle on resolve", () => {
  it("pays a correct 'aman' bet", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "TOGGLE_BET", player: 1, bet: "aman" }, SAFE);
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s = gameReducer(s, { type: "SUAP", bite: "ijo" }, SAFE);
    s = gameReducer(s, { type: "SAJIKAN" }, SAFE);
    expect(s.players[1].score).toBe(STARTING_SCORE + BET_STAKE);
  });
});

describe("milk cools heat", () => {
  it("reduces heat by SUSU_COOL", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s = gameReducer(s, { type: "SUAP", bite: "carolina" }, SAFE); // build heat, no bust
    const heat = s.heat;
    expect(heat).toBeGreaterThan(SUSU_COOL);
    s = gameReducer(s, { type: "MINUM_SUSU" }, SAFE);
    expect(s.heat).toBe(Math.max(0, heat - SUSU_COOL));
    expect(s.players[0].susu).toBe(0);
  });
});

describe("busting loses the round", () => {
  it("ends the turn with zero gained and zero score", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s = gameReducer(s, { type: "SUAP", bite: "carolina" }, SAFE); // safe, heat high
    s = gameReducer(s, { type: "SUAP", bite: "carolina" }, BUST_ROLL); // busts
    expect(s.outcome?.busted).toBe(true);
    expect(s.players[0].score).toBe(STARTING_SCORE); // no points gained, none lost
  });
});

describe("game advances and ends", () => {
  it("moves to gameover after every turn is played (closing the shop between rondes)", () => {
    let s = startedGame();
    // 2 players × CYCLES(4) = 8 turns. Bank a quick round each time.
    for (let t = 0; t < 8; t++) {
      s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
      s = gameReducer(s, { type: "SUAP", bite: "ijo" }, SAFE);
      s = gameReducer(s, { type: "SAJIKAN" }, SAFE);
      s = gameReducer(s, { type: "NEXT" }, SAFE);
      if (s.screen === "shop") s = gameReducer(s, { type: "CLOSE_SHOP" }, SAFE);
    }
    expect(s.screen).toBe("gameover");
  });
});

describe("shop between rondes", () => {
  it("opens after a ronde and lets you buy with points", () => {
    let s = startedGame();
    // play both players' turn-1 (bank quick) to finish ronde 1
    for (let t = 0; t < 2; t++) {
      s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
      s = gameReducer(s, { type: "SUAP", bite: "ijo" }, SAFE);
      s = gameReducer(s, { type: "SAJIKAN" }, SAFE);
      s = gameReducer(s, { type: "NEXT" }, SAFE);
    }
    expect(s.screen).toBe("shop");
    const before = s.players[0];
    s = gameReducer(s, { type: "BUY", player: 0, item: "susu" }, SAFE);
    expect(s.players[0].susu).toBe(before.susu + 1);
    expect(s.players[0].score).toBeLessThan(before.score);
    s = gameReducer(s, { type: "CLOSE_SHOP" }, SAFE);
    expect(s.screen).toBe("play");
  });
});
