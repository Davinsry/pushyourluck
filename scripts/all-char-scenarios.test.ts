import { describe, it } from "vitest";
import { gameReducer, initialState } from "../src/game";
import { CHARS } from "../src/config/balance";
import type { BiteId, Rng } from "../src/game/types";

function makeRng(seed: number): Rng {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("All Character Scenarios", () => {
  it("runs simulations for all characters and all scenarios", () => {
    const trials = 10000;
    const rng = makeRng(13579);

    const scenarios: { name: string; seq: BiteId[] }[] = [
      { name: "Hanya 1 Cabe Ijo", seq: ["ijo"] },
      { name: "Hanya 1 Cabe Rawit", seq: ["rawit"] },
      { name: "Hanya 1 Cabe Carolina", seq: ["carolina"] },
      { name: "2 Cabe Rawit", seq: ["rawit", "rawit"] },
      { name: "1 Cabe Ijo + 1 Cabe Carolina", seq: ["ijo", "carolina"] },
      { name: "1 Cabe Rawit + 1 Cabe Carolina", seq: ["rawit", "carolina"] },
      { name: "3 Cabe Rawit", seq: ["rawit", "rawit", "rawit"] },
      { name: "2 Cabe Carolina", seq: ["carolina", "carolina"] },
    ];

    console.log("Starting all characters scenario calculations...");

    scenarios.forEach((sc, idx) => {
      const seqStr = sc.seq.join(" + ");
      console.log(`\n================ SCENARIO ${idx + 1}: ${sc.name} (${seqStr}) ================`);

      const rows: { charName: string; bustRate: string; avgScore: string; avgSafeScore: string; avgHeat: string }[] = [];

      for (const [charId, charDef] of Object.entries(CHARS)) {
        let totalScore = 0;
        let safeScore = 0;
        let finalHeat = 0;
        let busts = 0;

        for (let t = 0; t < trials; t++) {
          let state = initialState(() => 0.5);
          state = gameReducer(state, { type: "SET_COUNT", count: 2 }, rng);
          state = gameReducer(state, { type: "START_DRAFT" }, rng);
          state = gameReducer(state, { type: "CHOOSE_CHAR", char: charId }, rng);
          state = gameReducer(state, { type: "CHOOSE_CHAR", char: charId === "baja" ? "hemat" : "baja" }, rng);

          // Player 0 turn
          state = gameReducer(state, { type: "CONFIRM_PRETURN" }, rng);

          let busted = false;
          for (const bite of sc.seq) {
            if (state.phase === "active") {
              const bowlIdx = state.secretBowls.indexOf(bite);
              state = gameReducer(state, { type: "SUAP", bowlIdx }, rng);
            }
            if (state.phase === "result" && state.outcome?.busted) {
              busted = true;
              break;
            }
          }

          if (!busted && state.phase === "active") {
            state = gameReducer(state, { type: "SAJIKAN" }, rng);
          }

          const outcome = state.outcome;
          if (outcome) {
            if (outcome.busted) {
              busts++;
            } else {
              totalScore += outcome.gained;
              safeScore += outcome.gained;
            }
            finalHeat += state.heat;
          }
        }

        const bustRate = ((busts / trials) * 100).toFixed(2) + "%";
        const avgScore = (totalScore / trials).toFixed(2);
        const safeCount = trials - busts;
        const avgSafeScore = safeCount > 0 ? (safeScore / safeCount).toFixed(2) : "0.00";
        const avgHeat = (finalHeat / trials).toFixed(2);

        rows.push({
          charName: charDef.name,
          bustRate,
          avgScore,
          avgSafeScore,
          avgHeat,
        });
      }

      console.log(`Karakter       | Peluang Bust | Rata2 Skor Total | Rata2 Skor jika Aman | Rata2 Pedas Akhir`);
      console.log(`-----------------------------------------------------------------------------------------`);
      rows.forEach((r) => {
        console.log(
          `${r.charName.padEnd(14)} | ${r.bustRate.padEnd(12)} | ${r.avgScore.padEnd(16)} | ${r.avgSafeScore.padEnd(20)} | ${r.avgHeat}`
        );
      });
    });
  });
});
