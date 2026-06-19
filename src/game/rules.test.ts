import { describe, expect, it } from "vitest";
import { BUST, FINAL_MULT, MULT, CHARS } from "../config/balance";
import { bustChance, multiplier, scoreBank, biteGain, randRange, draftOptions } from "./rules";
import type { Rng } from "./types";

// Deterministic rng helper: returns the values in order, looping.
const seq = (values: number[]): Rng => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe("bustChance", () => {
  it("is 0 below the offset", () => {
    expect(bustChance(0)).toBe(0);
    expect(bustChance(BUST.offset)).toBe(0);
  });
  it("tracks heat minus offset", () => {
    expect(bustChance(50)).toBe(50 - BUST.offset);
  });
  it("clamps at the cap", () => {
    expect(bustChance(999)).toBe(BUST.cap);
  });
});

describe("multiplier", () => {
  it("steps at the configured thresholds", () => {
    expect(multiplier(MULT.t15 - 1, null)).toBe(1);
    expect(multiplier(MULT.t15, null)).toBe(1.5);
    expect(multiplier(MULT.t2, null)).toBe(2);
  });
  it("caps for characters with maxMult", () => {
    expect(multiplier(MULT.t2, "kompor")).toBe(1.5);
    expect(multiplier(MULT.t2, "hemat")).toBe(1.5);
  });
});

describe("scoreBank", () => {
  it("applies the multiplier", () => {
    expect(scoreBank(10, MULT.t2, "rakus", false).gained).toBe(20);
  });
  it("adds the hemat safe bonus only below the threshold", () => {
    expect(scoreBank(10, 0, "hemat", false).gained).toBe(10 * 1 + CHARS.hemat.safeBonus);
    expect(scoreBank(10, 60, "hemat", false).hematBonus).toBe(0);
  });
  it("doubles on the final ronde", () => {
    expect(scoreBank(10, 0, null, true).gained).toBe(10 * FINAL_MULT);
  });
});

describe("biteGain", () => {
  it("respects the point range and character mod, min 1", () => {
    // rng 0 → min roll; rakus adds +3
    expect(biteGain("ijo", "rakus", seq([0]))).toBe(4 + CHARS.rakus.pointMod);
    // baja never goes below 1
    expect(biteGain("ijo", "baja", seq([0]))).toBe(Math.max(1, 4 + CHARS.baja.pointModPerChili.ijo));
  });
});

describe("randRange", () => {
  it("returns inclusive bounds", () => {
    expect(randRange(5, 8, seq([0]))).toBe(5);
    expect(randRange(5, 8, seq([0.9999]))).toBe(8);
  });
});

describe("draftOptions", () => {
  it("returns all characters when nothing taken", () => {
    expect(draftOptions()).toHaveLength(6);
  });
  it("excludes taken characters", () => {
    const opts = draftOptions(["baja", "rakus"]);
    expect(opts).not.toContain("baja");
    expect(opts).not.toContain("rakus");
    expect(opts).toHaveLength(4);
  });
});
