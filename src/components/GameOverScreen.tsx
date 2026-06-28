import { Crown, RotateCcw, Home, Trophy, Flame, Dice5, HelpCircle, Frown } from "lucide-react";
import { CHARS } from "../config/balance";
import type { Player } from "../game";
import { color } from "../ui/theme";
import { analyzePlaystyle, calculatePlaytestingStats } from "../game";

interface Props {
  players: Player[];
  onRestart: () => void;
  onReset: () => void;
}

export function GameOverScreen({ players, onRestart, onReset }: Props) {
  const ranked = players.map((p, i) => ({ ...p, i })).sort((a, b) => b.score - a.score);
  const topScore = ranked[0]?.score ?? 0;
  const winners = ranked.filter((p) => p.score === topScore);
  const title = winners.length > 1 ? "Seri!" : `${ranked[0].name} menang!`;

  const playtestingStats = calculatePlaytestingStats(players);

  return (
    <div className="mt-[18px] animate-pop rounded-[20px] bg-card p-[26px] text-center text-ink">
      <Crown size={44} className="mx-auto text-amber" />
      <p className="my-1.5 mb-0.5 text-[26px] font-extrabold text-chili-dark">{title}</p>
      <p className="m-0 mb-5 text-sm text-muted">Hasil akhir lomba makan pedas</p>

      {/* Ranks and Scores */}
      <div className="mb-[22px] grid gap-2">
        {ranked.map((p, rank) => {
          const isTop = p.score === topScore;
          const playstyle = p.stats ? analyzePlaystyle(p.stats) : null;
          return (
            <div
              key={p.i}
              className="flex items-start gap-3 rounded-xl px-4 py-3 text-left"
              style={{
                background: isTop ? "#FBE9C8" : "var(--c-cream)",
                border: isTop ? "2px solid var(--c-amber)" : "1.5px solid var(--c-cream-2)",
              }}
            >
              <span className="w-[22px] text-lg font-extrabold text-muted pt-0.5">{rank + 1}</span>
              <div className="flex-1">
                <div className="text-[17px] font-bold leading-tight">{p.name}</div>
                <div
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: p.char ? color(CHARS[p.char].colorKey) : "var(--c-muted)" }}
                >
                  {p.char ? CHARS[p.char].name : ""}
                </div>
                {playstyle && (
                  <div className="mt-1 text-[11px] font-bold text-flame">
                    🔥 Gaya: {playstyle.title}
                    <div className="text-[10px] text-muted font-medium leading-snug mt-0.5">
                      {playstyle.description}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                {isTop && <Trophy size={18} className="text-amber" />}
                <span className="text-xl font-extrabold text-chili-dark">{p.score}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistik Playtesting Card */}
      <div className="mb-[22px] rounded-xl border border-cream-2 bg-cream p-4 text-left">
        <h3 className="text-xs font-black text-chili-dark uppercase tracking-wider border-b border-cream-2 pb-1.5 mb-3 flex items-center gap-1">
          📊 Statistik Playtesting
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-lg bg-flame/10 p-1.5 text-flame shrink-0">
              <Flame size={16} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-muted uppercase tracking-wider leading-none">Cabai Terfavorit</div>
              <div className="text-xs font-extrabold text-ink leading-tight mt-1">{playtestingStats.favoriteChili}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-lg bg-steel/10 p-1.5 text-steel shrink-0">
              <Dice5 size={16} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-muted uppercase tracking-wider leading-none">Raja Terpedas</div>
              <div className="text-xs font-extrabold text-ink leading-tight mt-1">
                {playtestingStats.spiciestKing.name !== "-"
                  ? `${playtestingStats.spiciestKing.name} (${playtestingStats.spiciestKing.value} SHU)`
                  : "-"}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-lg bg-amber/10 p-1.5 text-amber shrink-0">
              <HelpCircle size={16} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-muted uppercase tracking-wider leading-none">Dukun Terjitu</div>
              <div className="text-xs font-extrabold text-ink leading-tight mt-1">
                {playtestingStats.bestGuesser.name !== "-"
                  ? `${playtestingStats.bestGuesser.name} (${playtestingStats.bestGuesser.value} Tebakan)`
                  : "-"}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-lg bg-chili/10 p-1.5 text-chili shrink-0">
              <Frown size={16} />
            </div>
            <div>
              <div className="text-[9px] font-bold text-muted uppercase tracking-wider leading-none">Sering Tersedak</div>
              <div className="text-xs font-extrabold text-ink leading-tight mt-1">
                {playtestingStats.mostBusted.name !== "-"
                  ? `${playtestingStats.mostBusted.name} (${playtestingStats.mostBusted.value} Bust)`
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        <button
          className="tp-btn flex flex-[1.4] items-center justify-center gap-2 rounded-[14px] bg-flame py-3.5 text-lg font-extrabold text-white"
          onClick={onRestart}
        >
          <RotateCcw size={19} /> Main Lagi
        </button>
        <button
          className="tp-btn flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-cream-2 py-3.5 text-lg font-extrabold text-ink"
          onClick={onReset}
        >
          <Home size={19} /> Menu
        </button>
      </div>
    </div>
  );
}
