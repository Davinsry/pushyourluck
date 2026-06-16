import { Crown } from "lucide-react";
import type { Player } from "../game";
import { playerColor } from "../ui/theme";

interface Props {
  players: Player[];
  activeIndex: number;
  cycle: number;
  cycles: number;
  isFinal: boolean;
  className?: string;
}

/** Vertical scoreboard: displays players sorted by highest points first, highlighted active player, and leader crown. */
export function Scoreboard({
  players,
  activeIndex,
  cycle,
  cycles,
  isFinal,
  className = "",
}: Props) {
  // Sort players by score descending, preserving their original index for seat colors and active checks
  const sortedPlayers = players
    .map((p, originalIndex) => ({ ...p, originalIndex }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className={`flex flex-col gap-2.5 pointer-events-auto ${className}`}>
      {/* Ronde info card */}
      <div
        className="rounded-2xl px-3 py-2 text-center text-xs font-bold border border-line/10 shadow-lg backdrop-blur-md"
        style={{
          backgroundColor: "rgba(30, 19, 13, 0.85)",
          color: isFinal ? "var(--c-amber)" : "var(--c-cream)",
        }}
      >
        <div className="text-[10px] uppercase tracking-wider text-muted font-bold">Ronde</div>
        <div className="text-sm font-extrabold leading-none mt-0.5">
          {cycle} / {cycles}
        </div>
        {isFinal && <div className="text-[9px] text-amber animate-pulse mt-0.5">PAMUNGKAS ×2</div>}
      </div>

      {/* Players List */}
      <div className="flex flex-col gap-1.5">
        {sortedPlayers.map((p, idx) => {
          const isActive = p.originalIndex === activeIndex;
          const isLeader = idx === 0 && p.score > 0;
          return (
            <div
              key={p.originalIndex}
              className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 transition-all duration-300 shadow-md border ${
                isActive
                  ? "bg-chili text-white border-chili scale-105"
                  : "bg-bg2/90 text-cream border-line/10 hover:border-line/20"
              }`}
              style={{
                backgroundColor: isActive ? undefined : "rgba(42, 27, 18, 0.85)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Seat color indicator */}
              <div
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ background: playerColor(p.originalIndex) }}
              />

              {/* Player Name and Score */}
              <div className="flex flex-col min-w-[70px] flex-1">
                <span className="text-[12px] font-extrabold truncate flex items-center gap-1 leading-tight">
                  {p.name}
                  {isLeader && <Crown size={11} className="text-amber fill-amber animate-bounce" />}
                </span>
                <span className={`text-[10px] font-bold leading-tight ${isActive ? "text-white/80" : "text-muted"}`}>
                  {p.score} Poin
                </span>
              </div>

              {/* Turn active indicator */}
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

