import { describe, it } from "vitest";
import { gameReducer, startStateFor, botActiveDecision, botBlockDecision, botSpectatorActions } from "../src/game";
import { CHARS, SHOP } from "../src/config/balance";
import type { CharacterId, Rng } from "../src/game/types";

// Seeded LCG or mulberry32 RNG
function makeRng(seed: number): Rng {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("Character Balance Simulation", () => {
  it("runs simulations and checks balance", () => {
    const playerCounts = [2, 3, 4];
    const gamesPerCount = 5000;
    
    // Seeded RNG
    const rng = makeRng(12345);

    console.log("Starting balance simulation...");

    for (const numPlayers of playerCounts) {
      // Record: { wins: number, scoreSum: number, games: number }
      const stats: Record<string, { wins: number; scoreSum: number; games: number }> = {};
      for (const charId of Object.keys(CHARS)) {
        stats[charId] = { wins: 0, scoreSum: 0, games: 0 };
      }

      for (let gameIdx = 0; gameIdx < gamesPerCount; gameIdx++) {
        // Initialize names
        const names = Array.from({ length: numPlayers }, (_, i) => `Player ${i + 1}`);
        let state = startStateFor(names, rng);
        state.settings.shop = true;
        
        // Ensure all players are bots
        state.players = state.players.map(p => ({ ...p, isBot: true }));

        // Draft phase: select unique characters randomly
        while (state.screen === "draft") {
          const available = state.draftOpts;
          const choice = available[Math.floor(rng() * available.length)];
          state = gameReducer(state, { type: "CHOOSE_CHAR", char: choice }, rng);
        }

        // Play the game step-by-step
        let steps = 0;
        const maxSteps = 5000;
        
        while (state.screen !== "gameover" && steps < maxSteps) {
          steps++;
          if (state.screen === "play") {
            if (state.phase === "preturn") {
              // Spectators (other bots) bet and sabotage
              const spectatorActs = botSpectatorActions(state, rng);
              for (const act of spectatorActs) {
                state = gameReducer(state, act, rng);
              }
              // Confirm preturn
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
                // Simple heuristic
                if (p.susu === 0 && p.score >= SHOP.susu) {
                  state = gameReducer(state, { type: "BUY", player: i, item: "susu" }, rng);
                  bought = true;
                } else if (p.tameng === 0 && p.score >= SHOP.tameng) {
                  state = gameReducer(state, { type: "BUY", player: i, item: "tameng" }, rng);
                  bought = true;
                } else if (p.sabotage === 0 && p.score >= SHOP.cabai) {
                  state = gameReducer(state, { type: "BUY", player: i, item: "cabai" }, rng);
                  bought = true;
                }
              }
            }
            state = gameReducer(state, { type: "CLOSE_SHOP" }, rng);
          } else {
            // Unhandled screen: skip/close/force gameover
            break;
          }
        }

        if (steps >= maxSteps) {
          console.warn(`Game reached maximum steps (${maxSteps}) and was forced to end.`);
        }

        // Determine winner(s)
        const scores = state.players.map(p => p.score);
        const maxScore = Math.max(...scores);
        const winners = state.players.filter(p => p.score === maxScore);
        const winShare = 1 / winners.length;

        // Record stats
        state.players.forEach(p => {
          const charId = p.char!;
          stats[charId].games++;
          stats[charId].scoreSum += p.score;
          if (p.score === maxScore) {
            stats[charId].wins += winShare;
          }
        });
      }

      console.log(`\n=== Player Count: ${numPlayers} ===`);
      console.log(`Character | Games | Win Rate | Avg Score`);
      console.log(`----------------------------------------`);
      for (const [charId, stat] of Object.entries(stats)) {
        const wr = ((stat.wins / stat.games) * 100).toFixed(2) + "%";
        const avgScore = (stat.scoreSum / stat.games).toFixed(2);
        console.log(`${charId.padEnd(9)} | ${stat.games.toString().padEnd(5)} | ${wr.padEnd(8)} | ${avgScore}`);
      }
    }
  });
});
