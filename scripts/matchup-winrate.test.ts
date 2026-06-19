import { describe, it } from "vitest";
import { gameReducer, startStateFor, botActiveDecision, botBlockDecision, botSpectatorActions } from "../src/game";
import { CHARS, SHOP } from "../src/config/balance";
import type { Rng } from "../src/game/types";

function makeRng(seed: number): Rng {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runGameWithChars(charIds: string[], rng: Rng): string[] {
  const numPlayers = charIds.length;
  const names = Array.from({ length: numPlayers }, (_, i) => `Player ${i + 1}`);
  let state = startStateFor(names, rng);
  state.settings.shop = true;
  state.players = state.players.map(p => ({ ...p, isBot: true }));

  let draftIdx = 0;
  while (state.screen === "draft" && draftIdx < numPlayers) {
    state = gameReducer(state, { type: "CHOOSE_CHAR", char: charIds[draftIdx] }, rng);
    draftIdx++;
  }

  let steps = 0;
  const maxSteps = 2000;
  while (state.screen !== "gameover" && steps < maxSteps) {
    steps++;
    if (state.screen === "play") {
      if (state.phase === "preturn") {
        const spectatorActs = botSpectatorActions(state, rng);
        for (const act of spectatorActs) {
          state = gameReducer(state, act, rng);
        }
        state = gameReducer(state, { type: "CONFIRM_PRETURN" }, rng);
        if (state.blockAsk) {
          const blockAct = botBlockDecision(state);
          state = gameReducer(state, blockAct, rng);
        }
      } else if (state.phase === "active") {
        const activeAct = botActiveDecision(state);
        state = gameReducer(state, activeAct, rng);
      } else if (state.phase === "result") {
        state = gameReducer(state, { type: "NEXT" }, rng);
      }
    } else if (state.screen === "shop") {
      for (let i = 0; i < numPlayers; i++) {
        let bought = true;
        while (bought) {
          bought = false;
          const p = state.players[i];
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
      break;
    }
  }

  const scores = state.players.map(p => p.score);
  const maxScore = Math.max(...scores);
  const winners: string[] = [];
  state.players.forEach(p => {
    if (p.score === maxScore) {
      winners.push(p.char!);
    }
  });
  return winners;
}

describe("Matchup Winrates", () => {
  it("simulates matchups for 2, 3, and 4 players", () => {
    const rng = makeRng(24680);
    const chars = Object.keys(CHARS);

    console.log("Starting matchup winrate simulations...");

    // ── 2 Players ──
    console.log("\n================ 2 PLAYERS MATCHUPS ================");
    const combos2: [string, string][] = [];
    for (let i = 0; i < chars.length; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        combos2.push([chars[i], chars[j]]);
      }
    }

    const rows2: string[] = [];
    combos2.forEach(([c1, c2]) => {
      const wins = { [c1]: 0, [c2]: 0 };
      const trials = 500;
      for (let t = 0; t < trials; t++) {
        const winners = runGameWithChars([c1, c2], rng);
        winners.forEach(w => {
          wins[w] += 1 / winners.length;
        });
      }
      const wr1 = ((wins[c1] / trials) * 100).toFixed(1) + "%";
      const wr2 = ((wins[c2] / trials) * 100).toFixed(1) + "%";
      rows2.push(`| ${c1.padEnd(9)} vs ${c2.padEnd(9)} | ${c1.padEnd(9)}: ${wr1.padEnd(6)} | ${c2.padEnd(9)}: ${wr2.padEnd(6)} |`);
    });

    console.log("| Matchup | Hasil Player 1 | Hasil Player 2 |");
    console.log("|---|---|---|");
    rows2.forEach(r => console.log(r));

    // ── 3 Players ──
    console.log("\n================ 3 PLAYERS MATCHUPS ================");
    const combos3: [string, string, string][] = [];
    for (let i = 0; i < chars.length; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        for (let k = j + 1; k < chars.length; k++) {
          combos3.push([chars[i], chars[j], chars[k]]);
        }
      }
    }

    const rows3: string[] = [];
    combos3.forEach(([c1, c2, c3]) => {
      const wins = { [c1]: 0, [c2]: 0, [c3]: 0 };
      const trials = 300;
      for (let t = 0; t < trials; t++) {
        const winners = runGameWithChars([c1, c2, c3], rng);
        winners.forEach(w => {
          wins[w] += 1 / winners.length;
        });
      }
      const wr1 = ((wins[c1] / trials) * 100).toFixed(1) + "%";
      const wr2 = ((wins[c2] / trials) * 100).toFixed(1) + "%";
      const wr3 = ((wins[c3] / trials) * 100).toFixed(1) + "%";
      rows3.push(`| ${c1.padEnd(9)} vs ${c2.padEnd(9)} vs ${c3.padEnd(9)} | ${c1.padEnd(9)}: ${wr1.padEnd(6)} | ${c2.padEnd(9)}: ${wr2.padEnd(6)} | ${c3.padEnd(9)}: ${wr3.padEnd(6)} |`);
    });

    console.log("| Matchup | Hasil Player 1 | Hasil Player 2 | Hasil Player 3 |");
    console.log("|---|---|---|---|");
    rows3.forEach(r => console.log(r));

    // ── 4 Players ──
    console.log("\n================ 4 PLAYERS MATCHUPS ================");
    const combos4: [string, string, string, string][] = [];
    for (let i = 0; i < chars.length; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        for (let k = j + 1; k < chars.length; k++) {
          for (let l = k + 1; l < chars.length; l++) {
            combos4.push([chars[i], chars[j], chars[k], chars[l]]);
          }
        }
      }
    }

    const rows4: string[] = [];
    combos4.forEach(([c1, c2, c3, c4]) => {
      const wins = { [c1]: 0, [c2]: 0, [c3]: 0, [c4]: 0 };
      const trials = 300;
      for (let t = 0; t < trials; t++) {
        const winners = runGameWithChars([c1, c2, c3, c4], rng);
        winners.forEach(w => {
          wins[w] += 1 / winners.length;
        });
      }
      const wr1 = ((wins[c1] / trials) * 100).toFixed(1) + "%";
      const wr2 = ((wins[c2] / trials) * 100).toFixed(1) + "%";
      const wr3 = ((wins[c3] / trials) * 100).toFixed(1) + "%";
      const wr4 = ((wins[c4] / trials) * 100).toFixed(1) + "%";
      rows4.push(`| ${c1.padEnd(9)} vs ${c2.padEnd(9)} vs ${c3.padEnd(9)} vs ${c4.padEnd(9)} | ${c1.padEnd(9)}: ${wr1.padEnd(6)} | ${c2.padEnd(9)}: ${wr2.padEnd(6)} | ${c3.padEnd(9)}: ${wr3.padEnd(6)} | ${c4.padEnd(9)}: ${wr4.padEnd(6)} |`);
    });

    console.log("| Matchup | Hasil Player 1 | Hasil Player 2 | Hasil Player 3 | Hasil Player 4 |");
    console.log("|---|---|---|---|---|");
    rows4.forEach(r => console.log(r));
  });
});
