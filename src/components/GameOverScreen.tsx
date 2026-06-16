import { Crown, RotateCcw, Trophy } from "lucide-react";
import { CHARS } from "../config/balance";
import type { Player } from "../game";
import { color } from "../ui/theme";

interface Props {
  players: Player[];
  onReset: () => void;
}

export function GameOverScreen({ players, onReset }: Props) {
  const ranked = players.map((p, i) => ({ ...p, i })).sort((a, b) => b.score - a.score);
  const topScore = ranked[0]?.score ?? 0;
  const winners = ranked.filter((p) => p.score === topScore);
  const title = winners.length > 1 ? "Seri!" : `${ranked[0].name} menang!`;

  return (
    <div className="mt-[18px] animate-pop rounded-[20px] bg-card p-[26px] text-center text-ink">
      <Crown size={44} className="mx-auto text-amber" />
      <p className="my-1.5 mb-0.5 text-[26px] font-extrabold text-chili-dark">{title}</p>
      <p className="m-0 mb-5 text-sm text-muted">Hasil akhir lomba makan pedas</p>

      <div className="mb-[22px] grid gap-2 text-left">
        {ranked.map((p, rank) => {
          const isTop = p.score === topScore;
          return (
            <div
              key={p.i}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: isTop ? "#FBE9C8" : "var(--c-cream)",
                border: isTop ? "2px solid var(--c-amber)" : "1.5px solid var(--c-cream-2)",
              }}
            >
              <span className="w-[22px] text-lg font-extrabold text-muted">{rank + 1}</span>
              <div className="flex-1">
                <div className="text-[17px] font-bold">{p.name}</div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: p.char ? color(CHARS[p.char].colorKey) : "var(--c-muted)" }}
                >
                  {p.char ? CHARS[p.char].name : ""}
                </div>
              </div>
              {isTop && <Trophy size={18} className="text-amber" />}
              <span className="text-xl font-extrabold text-chili-dark">{p.score}</span>
            </div>
          );
        })}
      </div>

      <button
        className="tp-btn flex w-full items-center justify-center gap-2 rounded-[14px] bg-flame py-3.5 text-lg font-extrabold text-white"
        onClick={onReset}
      >
        <RotateCcw size={19} /> Main lagi
      </button>
    </div>
  );
}
