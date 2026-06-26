import { describe, expect, it } from "vitest";
import { BUST, FINAL_MULT, MULT, CHARS } from "../config/balance";
import {
  bustChance,
  multiplier,
  scoreBank,
  biteGain,
  randRange,
  draftOptions,
  analyzePlaystyle,
  calculatePlaytestingStats,
  makePlayer,
} from "./rules";
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
    expect(multiplier(MULT.t2, "terawang", false)).toBe(2);
    expect(multiplier(MULT.t2, "terawang", true)).toBe(1);
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
    // rng 0 → min roll; rakus adds +1 for ijo
    expect(biteGain("ijo", "rakus", seq([0]))).toBe(4 + CHARS.rakus.pointModPerChili.ijo);
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

describe("analyzePlaystyle", () => {
  it("classifies Korban Kepedesan if busts >= 2", () => {
    const style = analyzePlaystyle({
      ijoCount: 5,
      rawitCount: 5,
      carolinaCount: 5,
      maxHeat: 100,
      correctBets: 5,
      busts: 2,
    });
    expect(style.title).toBe("Korban Kepedesan");
  });

  it("classifies Pengamat Ulung if correctBets is high and more than eating", () => {
    const style = analyzePlaystyle({
      ijoCount: 0,
      rawitCount: 0,
      carolinaCount: 0,
      maxHeat: 10,
      correctBets: 3,
      busts: 0,
    });
    expect(style.title).toBe("Pengamat Ulung");
  });

  it("classifies Carolina Lover if Carolina is dominant", () => {
    const style = analyzePlaystyle({
      ijoCount: 1,
      rawitCount: 2,
      carolinaCount: 5,
      maxHeat: 50,
      correctBets: 0,
      busts: 0,
    });
    expect(style.title).toBe("Carolina Lover");
  });

  it("classifies Rawit Taktis if Rawit is dominant", () => {
    const style = analyzePlaystyle({
      ijoCount: 1,
      rawitCount: 5,
      carolinaCount: 2,
      maxHeat: 50,
      correctBets: 0,
      busts: 0,
    });
    expect(style.title).toBe("Rawit Taktis");
  });

  it("classifies Cabe Ijo Lover if Cabe Ijo is dominant", () => {
    const style = analyzePlaystyle({
      ijoCount: 5,
      rawitCount: 1,
      carolinaCount: 0,
      maxHeat: 20,
      correctBets: 0,
      busts: 0,
    });
    expect(style.title).toBe("Cabe Ijo Lover");
  });

  it("classifies Pemain Taktis for a balanced profile", () => {
    const style = analyzePlaystyle({
      ijoCount: 0,
      rawitCount: 0,
      carolinaCount: 0,
      maxHeat: 0,
      correctBets: 0,
      busts: 0,
    });
    expect(style.title).toBe("Pemain Taktis");
  });
});

describe("calculatePlaytestingStats", () => {
  it("finds favorite chili and top players in each category", () => {
    const p1 = makePlayer(0, "Alice");
    p1.stats = {
      ijoCount: 2,
      rawitCount: 5,
      carolinaCount: 1,
      maxHeat: 60,
      correctBets: 1,
      busts: 2,
    };

    const p2 = makePlayer(1, "Bob");
    p2.stats = {
      ijoCount: 1,
      rawitCount: 1,
      carolinaCount: 4,
      maxHeat: 90,
      correctBets: 4,
      busts: 0,
    };

    const stats = calculatePlaytestingStats([p1, p2]);
    // Total: ijo 3, rawit 6, carolina 5 -> Rawit favorite
    expect(stats.favoriteChili).toBe("Cabe Rawit");
    expect(stats.spiciestKing).toEqual({ name: "Bob", value: 90 });
    expect(stats.bestGuesser).toEqual({ name: "Bob", value: 4 });
    expect(stats.mostBusted).toEqual({ name: "Alice", value: 2 });
  });

  it("returns default when no chilis eaten or stats are 0", () => {
    const p1 = makePlayer(0, "Alice");
    const p2 = makePlayer(1, "Bob");
    const stats = calculatePlaytestingStats([p1, p2]);
    expect(stats.favoriteChili).toBe("Belum ada");
    expect(stats.spiciestKing.name).toBe("-");
    expect(stats.bestGuesser.name).toBe("-");
    expect(stats.mostBusted.name).toBe("-");
  });
});
