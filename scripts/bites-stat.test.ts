import { describe, it } from "vitest";
import { gameReducer, startStateFor, botActiveDecision, botBlockDecision, botSpectatorActions } from "../src/game";
import { CHARS } from "../src/config/balance";
import type { Rng } from "../src/game/types";

function makeRng(seed: number): Rng {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("Chili Bite Statistics", () => {
  it("runs simulations and tracks chili bite counts per character", () => {
    const playerCounts = [2, 3, 4];
    const gamesPerCount = 5000;
    const rng = makeRng(54321);

    for (const numPlayers of playerCounts) {
      const stats: Record<string, { totalBites: number; ijo: number; rawit: number; carolina: number; turns: number; games: number }> = {};
      for (const charId of Object.keys(CHARS)) {
        stats[charId] = { totalBites: 0, ijo: 0, rawit: 0, carolina: 0, turns: 0, games: 0 };
      }

      for (let gameIdx = 0; gameIdx < gamesPerCount; gameIdx++) {
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

        // Record games played per character
        state.players.forEach(p => {
          if (p.char) {
            stats[p.char].games++;
          }
        });

        // Play the game step-by-step
        let steps = 0;
        const maxSteps = 5000;
        let lastActiveSeat = -1;

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
              const activeSeat = state.turn % state.players.length;
              const activeChar = state.players[activeSeat].char!;
              
              if (activeSeat !== lastActiveSeat) {
                stats[activeChar].turns++;
                lastActiveSeat = activeSeat;
              }

              const activeAct = botActiveDecision(state);
              if (activeAct.type === "SUAP") {
                stats[activeChar].totalBites++;
                if (activeAct.bite === "ijo") stats[activeChar].ijo++;
                if (activeAct.bite === "rawit") stats[activeChar].rawit++;
                if (activeAct.bite === "carolina") stats[activeChar].carolina++;
              }

              state = gameReducer(state, activeAct, rng);
            } else if (state.phase === "result") {
              state = gameReducer(state, { type: "NEXT" }, rng);
              lastActiveSeat = -1;
            }
          } else if (state.screen === "shop") {
            state = gameReducer(state, { type: "CLOSE_SHOP" }, rng);
          } else {
            break;
          }
        }
      }

      console.log(`\n=== Player Count: ${numPlayers} ===`);
      console.log(`Character | Games | Avg Bites/Game | Avg Bites/Turn | Cabe Ijo % | Cabe Rawit % | Carolina %`);
      console.log(`-----------------------------------------------------------------------------------------`);
      for (const [charId, stat] of Object.entries(stats)) {
        if (stat.games === 0) continue;
        const avgBitesGame = (stat.totalBites / stat.games).toFixed(2);
        const avgBitesTurn = (stat.totalBites / stat.turns).toFixed(2);
        const ijoPct = stat.totalBites > 0 ? ((stat.ijo / stat.totalBites) * 100).toFixed(1) + "%" : "0%";
        const rawitPct = stat.totalBites > 0 ? ((stat.rawit / stat.totalBites) * 100).toFixed(1) + "%" : "0%";
        const caroPct = stat.totalBites > 0 ? ((stat.carolina / stat.totalBites) * 100).toFixed(1) + "%" : "0%";
        
        console.log(
          `${charId.padEnd(9)} | ${stat.games.toString().padEnd(5)} | ${avgBitesGame.padEnd(14)} | ${avgBitesTurn.padEnd(14)} | ${ijoPct.padEnd(10)} | ${rawitPct.padEnd(12)} | ${caroPct}`
        );
      }
    }
  });
});
