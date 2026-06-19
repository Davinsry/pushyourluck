import { describe, it } from "vitest";
import { gameReducer, initialState } from "../src/game";
import type { Action, BiteId, GameState, Rng } from "../src/game/types";

function makeRng(seed: number): Rng {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("Mathematical Scenario Calculator", () => {
  it("simulates predefined chili bite sequences for Si Hemat and Si Lidah Baja", () => {
    const trials = 10000;
    const rng = makeRng(98765);

    // We define a bite sequence progression for 6 rounds:
    const sequences: Record<number, BiteId[]> = {
      1: ["ijo"], // 1 ijo
      2: ["ijo", "rawit"], // 1 ijo + 1 rawit
      3: ["ijo", "rawit", "carolina"], // 1 ijo + 1 rawit + 1 carolina
      4: ["ijo", "rawit", "carolina", "carolina"], // 1 ijo + 1 rawit + 2 carolina
      5: ["ijo", "rawit", "rawit", "carolina", "carolina"], // 1 ijo + 2 rawit + 2 carolina
      6: ["ijo", "rawit", "rawit", "carolina", "carolina", "carolina"], // 1 ijo + 2 rawit + 3 carolina
    };

    console.log("Starting scenario simulation (10,000 trials per round)...");

    for (let round = 1; round <= 6; round++) {
      const seq = sequences[round];
      const seqStr = seq.join(" + ");

      // We track stats for both players:
      // Player 0: hemat
      // Player 1: baja
      const playersStats = [
        { name: "Si Hemat", char: "hemat", totalScore: 0, safeScore: 0, finalHeat: 0, busts: 0 },
        { name: "Si Lidah Baja", char: "baja", totalScore: 0, safeScore: 0, finalHeat: 0, busts: 0 },
      ];

      for (let pIdx = 0; pIdx < 2; pIdx++) {
        const pStat = playersStats[pIdx];

        for (let t = 0; t < trials; t++) {
          // Initialize game for 2 players
          let state = initialState(() => 0.5);
          state = gameReducer(state, { type: "SET_COUNT", count: 2 }, rng);
          state = gameReducer(state, { type: "START_DRAFT" }, rng);

          // Force the draft: player 0 gets hemat, player 1 gets baja
          state = gameReducer(state, { type: "CHOOSE_CHAR", char: "hemat" }, rng);
          state = gameReducer(state, { type: "CHOOSE_CHAR", char: "baja" }, rng);

          // Move the active index to our target player (using pass/next if needed,
          // but since player 0 starts, if we want player 1, we simulate player 0 banking first).
          if (pIdx === 1) {
            // Player 0 takes a quick turn and banks to pass the turn to Player 1
            state = gameReducer(state, { type: "CONFIRM_PRETURN" }, rng);
            state = gameReducer(state, { type: "SAJIKAN" }, rng);
            state = gameReducer(state, { type: "NEXT" }, rng);
          }

          // Now it's the target player's turn
          // Start the turn
          state = gameReducer(state, { type: "CONFIRM_PRETURN" }, rng);
          if (state.blockAsk) {
            state = gameReducer(state, { type: "ACCEPT_HEAT" }, rng);
          }

          // Feed the predefined sequence of chilis
          let busted = false;
          for (const bite of seq) {
            if (state.phase === "active") {
              state = gameReducer(state, { type: "SUAP", bite }, rng);
            }
            if (state.phase === "result" && state.outcome?.busted) {
              busted = true;
              break;
            }
          }

          // If survived, bank
          if (!busted && state.phase === "active") {
            state = gameReducer(state, { type: "SAJIKAN" }, rng);
          }

          // Record stats from the outcome
          const outcome = state.outcome;
          if (outcome) {
            if (outcome.busted) {
              pStat.busts++;
            } else {
              pStat.totalScore += outcome.gained;
              pStat.safeScore += outcome.gained;
            }
            pStat.finalHeat += state.heat;
          }
        }
      }

      console.log(`\n=== RONDE ${round} (Sequence: ${seqStr}) ===`);
      console.log(`Karakter     | Bust Rate | Rata2 Skor Total | Rata2 Skor jika Aman | Rata2 Pedas Akhir`);
      console.log(`-------------------------------------------------------------------------------------`);
      playersStats.forEach((p) => {
        const bustRate = ((p.busts / trials) * 100).toFixed(2) + "%";
        const avgScore = (p.totalScore / trials).toFixed(2);
        const safeCount = trials - p.busts;
        const avgSafeScore = safeCount > 0 ? (p.safeScore / safeCount).toFixed(2) : "0.00";
        const avgHeat = (p.finalHeat / trials).toFixed(2);
        console.log(
          `${p.name.padEnd(12)} | ${bustRate.padEnd(9)} | ${avgScore.padEnd(16)} | ${avgSafeScore.padEnd(20)} | ${avgHeat}`
        );
      });
    }
  });
});
