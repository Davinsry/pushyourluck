import { describe, it } from "vitest";
import { gameReducer, startStateFor, botActiveDecision, botBlockDecision, botSpectatorActions } from "../src/game";
import { CHARS, SHOP } from "../src/config/balance";
import type { Rng } from "../src/game/types";
import * as fs from "fs";

// Seeded LCG or mulberry32 RNG
function makeRng(seed: number): Rng {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("CSV Data Generator", () => {
  it("runs simulations and exports results to simulation_data.csv", () => {
    const playerCounts = [2, 3, 4];
    const gamesPerCount = 100000;
    const rng = makeRng(12345);
    
    const csvRows = ["game_id,player_count,seat,character,score,is_winner,total_steps"];
    let globalGameId = 1;

    console.log("Starting CSV data generation simulation...");

    for (const numPlayers of playerCounts) {
      console.log(`Simulating games for ${numPlayers} players...`);
      for (let gameIdx = 0; gameIdx < gamesPerCount; gameIdx++) {
        const gameId = globalGameId++;
        const names = Array.from({ length: numPlayers }, (_, i) => `Player ${i + 1}`);
        let state = startStateFor(names, rng);
        state.settings.shop = true;
        state.players = state.players.map(p => ({ ...p, isBot: true }));

        // Draft phase
        while (state.screen === "draft") {
          const available = state.draftOpts;
          const choice = available[Math.floor(rng() * available.length)];
          state = gameReducer(state, { type: "CHOOSE_CHAR", char: choice }, rng);
        }

        // Play phase
        let steps = 0;
        const maxSteps = 1000;
        while (state.screen !== "gameover" && steps < maxSteps) {
          steps++;
          if (state.screen === "play") {
            if (state.phase === "preturn") {
              const spectatorActs = botSpectatorActions(state, rng);
              for (const act of spectatorActs) {
                state = gameReducer(state, act, rng);
              }
              state = gameReducer(state, { type: "CONFIRM_PRETURN" }, rng);
            } else if (state.phase === "active") {
              const activeAct = botActiveDecision(state);
              state = gameReducer(state, activeAct, rng);
            } else if (state.phase === "result") {
              state = gameReducer(state, { type: "NEXT" }, rng);
            }
          } else if (state.screen === "shop") {
            // Bots buy items in the shop
            for (let i = 0; i < numPlayers; i++) {
              let bought = true;
              while (bought) {
                bought = false;
                const p = state.players[i];
                if (p.susu === 0 && p.score >= SHOP.susu) {
                  state = gameReducer(state, { type: "BUY", player: i, item: "susu" }, rng);
                  bought = true;
                }
              }
            }
            state = gameReducer(state, { type: "CLOSE_SHOP" }, rng);
          } else {
            break;
          }
        }

        // Determine winner
        const scores = state.players.map(p => p.score);
        const maxScore = Math.max(...scores);
        const winnerCount = state.players.filter(p => p.score === maxScore).length;

        state.players.forEach((p, i) => {
          // Fractional win share for ties
          const isWinner = p.score === maxScore ? (1 / winnerCount) : 0;
          csvRows.push(`${gameId},${numPlayers},${i},${p.char},${p.score},${isWinner},${steps}`);
        });
      }
    }

    fs.writeFileSync("simulation_data.csv", csvRows.join("\n"), "utf-8");
    console.log("CSV generated successfully as 'simulation_data.csv'!");
  });
});
