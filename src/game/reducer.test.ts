import { describe, expect, it } from "vitest";
import { BET_STAKE, STARTING_SCORE, SUSU_COOL } from "../config/balance";
import { gameReducer, initialState, type GameState } from "./index";
import type { Action, Rng } from "./types";

// Deterministic rng returning the given values in order, looping.
const seq = (values: number[]): Rng => {
  let i = 0;
  return () => values[i++ % values.length];
};

// rollBust busts when rng()*100 < bustChance, so a high roll is always safe.
const SAFE: Rng = () => 0.999; // never busts; also yields max point rolls
const BUST_ROLL: Rng = () => 0; // busts whenever heat is above the offset

const run = (state: GameState, actions: Action[], rng: Rng) =>
  actions.reduce((s, a) => gameReducer(s, a, rng), state);

const startedGame = (): GameState =>
  run(initialState(seq([0.1, 0.1, 0.1])), [
    { type: "SET_COUNT", count: 2 },
    { type: "START_DRAFT" },
    { type: "CHOOSE_CHAR", char: "rakus" },
    { type: "CHOOSE_CHAR", char: "rakus" },
  ], seq([0.1, 0.1, 0.1]));

describe("setup → draft → play", () => {
  it("reaches the play screen with both characters chosen", () => {
    const s = startedGame();
    expect(s.screen).toBe("play");
    expect(s.players.every((p) => p.char === "rakus")).toBe(true);
    expect(s.phase).toBe("preturn");
  });
});

describe("sabotage and peeking", () => {
  it("queues traps then applies them on turn start", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "ADD_SABO", player: 1 }, SAFE);
    expect(s.pendingTraps).toBe(1);
    expect(s.players[1].sabotage).toBe(0);

    // Roll 3 ijos (r = 0.1), then trap at index 0 (pickIdx = 0)
    const seqRng = seq([0.1, 0.1, 0.1, 0.0]);
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, seqRng);
    expect(s.phase).toBe("active");
    expect(s.secretBowls[0]).toBe("carolina");
    expect(s.secretBowls[1]).toBe("ijo");
    expect(s.secretBowls[2]).toBe("ijo");
  });

  it("allows a spectator to stack multiple sabotage traps", () => {
    let s = startedGame();
    s.players[1].sabotage = 3;
    s = gameReducer(s, { type: "ADD_SABO", player: 1 }, SAFE);
    s = gameReducer(s, { type: "ADD_SABO", player: 1 }, SAFE);
    expect(s.pendingTraps).toBe(2);
    expect(s.players[1].sabotage).toBe(1);
  });

  it("uses shield to peek at a bowl", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s.players[0].tameng = 2;
    s.secretBowls = ["ijo", "rawit", "carolina"];
    s = gameReducer(s, { type: "INTIP_BOWL", bowlIdx: 1 }, SAFE);
    expect(s.revealedBowls[1]).toBe(true);
    expect(s.players[0].tameng).toBe(1);
    expect(s.feedback).toContain("Mengintip Mangkok 2: isinya ternyata Cabe Cabe Rawit");
  });
});

describe("eating and banking", () => {
  it("accrues points on a safe bite and banks them", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s.secretBowls = ["ijo", "rawit", "carolina"];
    s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, SAFE);
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
    s.secretBowls = ["ijo", "rawit", "carolina"];
    s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, SAFE);
    s = gameReducer(s, { type: "SAJIKAN" }, SAFE);
    expect(s.players[1].score).toBe(STARTING_SCORE + BET_STAKE);
  });
});

describe("milk cools heat", () => {
  it("reduces heat by SUSU_COOL", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s.secretBowls = ["ijo", "rawit", "carolina"];
    s = gameReducer(s, { type: "SUAP", bowlIdx: 2 }, SAFE); // Eat carolina to build heat
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
    s.secretBowls = ["carolina", "carolina", "carolina"];
    s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, SAFE); // safe
    s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, BUST_ROLL); // busts
    expect(s.outcome?.busted).toBe(true);
    expect(s.players[0].score).toBe(STARTING_SCORE);
  });
});

describe("game advances and ends", () => {
  it("moves to gameover after every turn is played (closing the shop between rondes)", () => {
    let s = startedGame();
    // 2 players × CYCLES(4) = 8 turns. Bank a quick round each time.
    for (let t = 0; t < 8; t++) {
      s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
      s.secretBowls = ["ijo", "ijo", "ijo"];
      s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, SAFE);
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
      s.secretBowls = ["ijo", "ijo", "ijo"];
      s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, SAFE);
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

describe("turn timeout behavior (SKIP_TURN)", () => {
  it("forfeits the turn if roundPts is 0", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s = gameReducer(s, { type: "SKIP_TURN" }, SAFE);
    expect(s.phase).toBe("preturn");
    expect(s.turn).toBe(1);
    expect(s.players[0].score).toBe(STARTING_SCORE);
  });

  it("automatically banks accumulated points if roundPts > 0", () => {
    let s = startedGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" }, SAFE);
    s.secretBowls = ["ijo", "ijo", "ijo"];
    s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, SAFE);
    expect(s.roundPts).toBeGreaterThan(0);
    const expectedScore = STARTING_SCORE + s.roundPts;
    s = gameReducer(s, { type: "SKIP_TURN" }, SAFE);
    expect(s.phase).toBe("result");
    expect(s.outcome?.busted).toBe(false);
    expect(s.players[0].score).toBe(expectedScore);
  });
});

describe("Lidah Baja passive shield", () => {
  const startedBajaGame = (): GameState =>
    run(initialState(seq([0.1, 0.1, 0.1])), [
      { type: "SET_COUNT", count: 2 },
      { type: "START_DRAFT" },
      { type: "CHOOSE_CHAR", char: "baja" },
      { type: "CHOOSE_CHAR", char: "rakus" },
    ], seq([0.1, 0.1, 0.1]));

  it("initializes passiveShields to 2 and passiveShieldActivated to false", () => {
    const s = startedBajaGame();
    expect(s.players[0].passiveShields).toBe(2);
    expect(s.passiveShieldActivated).toBe(false);
  });

  it("toggles passiveShieldActivated action", () => {
    let s = startedBajaGame();
    s = gameReducer(s, { type: "TOGGLE_PASSIVE_SHIELD" });
    expect(s.passiveShieldActivated).toBe(true);
    s = gameReducer(s, { type: "TOGGLE_PASSIVE_SHIELD" });
    expect(s.passiveShieldActivated).toBe(false);
  });

  it("consumes passive shield charge on turn start if activated", () => {
    let s = startedBajaGame();
    s = gameReducer(s, { type: "TOGGLE_PASSIVE_SHIELD" });
    s = gameReducer(s, { type: "CONFIRM_PRETURN" });
    expect(s.players[0].passiveShields).toBe(1);
    expect(s.shieldUsed).toBe(false); // active/available survival
    expect(s.passiveShieldActivated).toBe(false); // resets
  });

  it("does not consume passive shield charge on turn start if not activated", () => {
    let s = startedBajaGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" });
    expect(s.players[0].passiveShields).toBe(2);
    expect(s.shieldUsed).toBe(true); // unavailable survival
  });

  it("survives bust automatically if shield is active", () => {
    let s = startedBajaGame();
    s = gameReducer(s, { type: "TOGGLE_PASSIVE_SHIELD" });
    s = gameReducer(s, { type: "CONFIRM_PRETURN" });
    s.secretBowls = ["carolina", "carolina", "carolina"];
    s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, BUST_ROLL);
    expect(s.phase).toBe("active"); // did not bust!
    expect(s.shieldUsed).toBe(true); // shield is spent
    expect(s.roundPts).toBeGreaterThan(0);
    expect(s.feedback).toContain("Perut baja nahan! Selamat sekali.");

    s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, BUST_ROLL);
    expect(s.phase).toBe("result"); // busted now!
    expect(s.outcome?.busted).toBe(true);
  });

  it("does not survive bust if shield is not active", () => {
    let s = startedBajaGame();
    s = gameReducer(s, { type: "CONFIRM_PRETURN" });
    s.secretBowls = ["carolina", "carolina", "carolina"];
    s = gameReducer(s, { type: "SUAP", bowlIdx: 0 }, BUST_ROLL);
    expect(s.phase).toBe("result"); // busted immediately!
    expect(s.outcome?.busted).toBe(true);
  });
});
