import { describe, it } from "vitest";
import { gameReducer, initialState } from "../src/game";
import { CHARS } from "../src/config/balance";
import type { BiteId, Rng } from "../src/game/types";
import * as fs from "fs";
import * as path from "path";

function makeRng(seed: number): Rng {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("All Character Scenarios Markdown Generator", () => {
  it("simulates 12 scenarios for all 6 characters and writes to markdown", () => {
    const trials = 10000;
    const rng = makeRng(112233);

    const scenarios: { name: string; seq: BiteId[] }[] = [
      { name: "1 Cabe Ijo", seq: ["ijo"] },
      { name: "1 Cabe Rawit", seq: ["rawit"] },
      { name: "1 Cabe Carolina", seq: ["carolina"] },
      { name: "2 Cabe Ijo", seq: ["ijo", "ijo"] },
      { name: "1 Cabe Ijo + 1 Cabe Rawit", seq: ["ijo", "rawit"] },
      { name: "1 Cabe Ijo + 1 Cabe Carolina", seq: ["ijo", "carolina"] },
      { name: "2 Cabe Rawit", seq: ["rawit", "rawit"] },
      { name: "1 Cabe Rawit + 1 Cabe Carolina", seq: ["rawit", "carolina"] },
      { name: "2 Cabe Carolina", seq: ["carolina", "carolina"] },
      { name: "3 Cabe Rawit", seq: ["rawit", "rawit", "rawit"] },
      { name: "2 Cabe Rawit + 1 Cabe Carolina", seq: ["rawit", "rawit", "carolina"] },
      { name: "3 Cabe Carolina", seq: ["carolina", "carolina", "carolina"] },
    ];

    const mdLines: string[] = [];
    mdLines.push("# Tabel Probabilitas & Hasil Skor Semua Karakter");
    mdLines.push("");
    mdLines.push("Dokumen ini memuat statistik lengkap (Bust Rate, Skor Rata-rata, Pedas Akhir) untuk semua 6 karakter di game **Tahan Pedas** berdasarkan 12 skenario kombinasi cabai yang berbeda. Setiap skenario disimulasikan sebanyak **10.000 kali uji coba**.");
    mdLines.push("");

    scenarios.forEach((sc, idx) => {
      const seqStr = sc.seq.join(" + ");
      mdLines.push(`## Skenario ${idx + 1}: ${sc.name} (\`${seqStr}\`)`);
      mdLines.push("");
      mdLines.push("| Karakter | Peluang Bust (Mati) | Rata2 Skor Total | Rata2 Skor jika Aman | Rata2 Pedas Akhir |");
      mdLines.push("| :--- | :---: | :---: | :---: | :---: |");

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

        mdLines.push(`| ${charDef.name} | ${bustRate} | ${avgScore} | ${avgSafeScore} | ${avgHeat} |`);
      }
      mdLines.push("");
    });

    const artifactPath = path.join("C:\\Users\\Davin\\.gemini\\antigravity\\brain\\159c6ee3-c13e-4a59-b5be-e8ae012783e2", "all_character_probabilities.md");
    fs.writeFileSync(artifactPath, mdLines.join("\n"), "utf-8");
    console.log("Successfully generated all_character_probabilities.md!");
  });
});
