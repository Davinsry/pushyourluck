import { describe, expect, it } from "vitest";
import { CHARS } from "../config/balance";
import { draftOptions } from "./rules";
import { botActiveDecision, botSpectatorActions } from "./bot";
import { actionAllowed, gameReducer, initialState, startStateFor, totalTurns } from "./reducer";
import type { GameState, Rng } from "./types";

const seq = (values: number[]): Rng => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("draftOptions uniqueness", () => {
  it("never offers a character already taken", () => {
    const all = Object.keys(CHARS) as (keyof typeof CHARS)[];
    const taken = all.slice(0, all.length - 2);
    const opts = draftOptions(taken);
    for (const t of taken) expect(opts).not.toContain(t);
    expect(opts).toHaveLength(2);
  });

  it("there are 6 characters to draft from", () => {
    expect(Object.keys(CHARS)).toHaveLength(6);
    expect(draftOptions()).toHaveLength(6);
  });
});

describe("settings drive the round count", () => {
  it("totalTurns scales with settings.cycles", () => {
    const base = initialState(seq([0, 0]));
    const s2 = gameReducer({ ...base, players: base.players }, { type: "SET_CYCLES", cycles: 6 }, seq([0]));
    expect(s2.settings.cycles).toBe(6);
    expect(totalTurns(s2)).toBe(base.players.length * 6);
  });
});

describe("bot decisions", () => {
  const play = (over: Partial<GameState>): GameState => ({
    ...initialState(seq([0, 0])),
    screen: "play",
    mode: "solo",
    players: [
      { name: "Kamu", score: 0, char: "rakus", susu: 1, isBot: false, passiveShields: 2, terawangCharges: 0 },
      { name: "Bot 1", score: 0, char: "rakus", susu: 1, isBot: true, passiveShields: 2, terawangCharges: 0 },
    ],
    phase: "active",
    ...over,
  });

  it("banks when it has points and the heat is dangerous", () => {
    const base = play({ turn: 1, heat: 90, roundPts: 12 });
    const s = {
      ...base,
      players: base.players.map((p, i) => (i === 1 ? { ...p, susu: 0 } : p)),
    };
    expect(botActiveDecision(s).type).toBe("SAJIKAN");
  });

  it("eats while it is still cool", () => {
    const s = play({ turn: 1, heat: 0, roundPts: 0 });
    expect(botActiveDecision(s).type).toBe("SUAP");
  });

  it("a bot spectator places a bet", () => {
    const s = play({ turn: 0, phase: "preturn" }); // human (seat 0) active → bot is spectator
    const acts = botSpectatorActions(s, () => 0.9);
    expect(acts.some((a) => a.type === "TOGGLE_BET" && a.player === 1)).toBe(true);
  });
});

describe("online authority (actionAllowed + startStateFor)", () => {
  it("startStateFor produces a draft-ready state with the given names", () => {
    const s = startStateFor(["A", "B", "C"], seq([0, 0]));
    expect(s.screen).toBe("draft");
    expect(s.players.map((p) => p.name)).toEqual(["A", "B", "C"]);
    expect(s.draftOpts).toHaveLength(6); // free pick from all characters
    expect(s.settings.shop).toBe(false); // shop disabled online
  });

  it("only the drafting seat may CHOOSE_CHAR", () => {
    const s = startStateFor(["A", "B"], seq([0, 0])); // draftIdx 0
    expect(actionAllowed(s, 0, { type: "CHOOSE_CHAR", char: s.draftOpts[0] })).toBe(true);
    expect(actionAllowed(s, 1, { type: "CHOOSE_CHAR", char: s.draftOpts[0] })).toBe(false);
  });

  it("you may only bet for your own seat, and not when you're active", () => {
    let s = startStateFor(["A", "B"], seq([0, 0]));
    s = gameReducer(s, { type: "CHOOSE_CHAR", char: s.draftOpts[0] }, seq([0]));
    s = gameReducer(s, { type: "CHOOSE_CHAR", char: s.draftOpts[0] }, seq([0])); // → play, seat 0 active
    expect(actionAllowed(s, 1, { type: "TOGGLE_BET", player: 1, bet: "aman" })).toBe(true);
    expect(actionAllowed(s, 1, { type: "TOGGLE_BET", player: 0, bet: "aman" })).toBe(false);
    expect(actionAllowed(s, 0, { type: "TOGGLE_BET", player: 0, bet: "aman" })).toBe(false); // active can't bet
    expect(actionAllowed(s, 1, { type: "SUAP", bowlIdx: 0 })).toBe(false); // only active eats
    expect(actionAllowed(s, 0, { type: "SUAP", bowlIdx: 0 })).toBe(true);
  });
});
