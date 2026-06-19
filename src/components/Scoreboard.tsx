import { useState } from "react";
import { Crown, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import type { Player } from "../game";
import { playerColor } from "../ui/theme";

interface Props {
  players: Player[];
  activeIndex: number;
  cycle: number;
  cycles: number;
  isFinal: boolean;
  className?: string;
  activeEmotes?: Record<number, string>;
}

/** Vertical scoreboard: displays players sorted by highest points first, highlighted active player, and leader crown. */
export function Scoreboard({
  players,
  activeIndex,
  cycle,
  cycles,
  isFinal,
  className = "",
  activeEmotes,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sort players by score descending, preserving their original index for seat colors and active checks
  const sortedPlayers = players
    .map((p, originalIndex) => ({ ...p, originalIndex }))
    .sort((a, b) => b.score - a.score);

  return (
    <div
      className={`pointer-events-auto flex flex-col rounded-2xl border border-line/20 shadow-2xl transition-all duration-300 ${className}`}
      style={{
        backgroundColor: "rgba(28, 17, 11, 0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header (clickable to collapse/expand) */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between p-2.5 cursor-pointer select-none hover:bg-white/5 transition-colors rounded-t-2xl"
      >
        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-wider text-muted font-bold leading-none">Ronde</span>
          <span className={`text-xs font-black leading-none mt-1 ${isFinal ? "text-amber" : "text-cream"}`}>
            {cycle} / {cycles}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isFinal ? (
            <Crown size={12} className="text-amber fill-amber animate-pulse" />
          ) : (
            <Trophy size={11} className="text-muted" />
          )}
          {isCollapsed ? <ChevronDown size={12} className="text-muted" /> : <ChevronUp size={12} className="text-muted" />}
        </div>
      </div>

      {/* Final Ronde Badge inside Header (when expanded) */}
      {isFinal && !isCollapsed && (
        <div className="mx-2 mb-1.5 rounded-lg bg-amber/10 py-1 text-center text-[9px] font-black text-amber animate-pulse border border-amber/10">
          PAMUNGKAS ×2
        </div>
      )}

      {/* Separator line when expanded */}
      {!isCollapsed && <div className="h-[1px] bg-line/10 w-full" />}

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="flex flex-col gap-1.5 p-2 bg-black/15 rounded-b-2xl">
          {sortedPlayers.map((p, idx) => {
            const isActive = p.originalIndex === activeIndex;
            const isLeader = idx === 0 && p.score > 0;
            const activeEmote = activeEmotes?.[p.originalIndex];
            return (
              <div
                key={p.originalIndex}
                className={`relative flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-all duration-300 border ${
                  isActive
                    ? "bg-chili text-white border-chili shadow-md scale-102"
                    : "bg-bg2/40 text-cream border-line/5 hover:border-line/15"
                }`}
                style={{
                  backgroundColor: isActive ? undefined : "rgba(42, 27, 18, 0.4)",
                }}
              >
                {/* Seat color indicator */}
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ background: playerColor(p.originalIndex) }}
                />

                {/* Player Name and Score */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-black truncate flex items-center gap-0.5 leading-tight">
                    {p.name}
                    {isLeader && <Crown size={9} className="text-amber fill-amber flex-shrink-0" />}
                  </span>
                  <span className={`text-[9px] font-bold leading-tight ${isActive ? "text-white/80" : "text-muted"}`}>
                    {p.score} Poin
                  </span>
                </div>

                {/* Turn active indicator ping dot */}
                {isActive && (
                  <div className="h-1 w-1 rounded-full bg-white animate-ping flex-shrink-0" />
                )}

                {/* Emote Bubble */}
                {activeEmote && (
                  <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 bg-cream border-2 border-line/20 px-2.5 py-1 rounded-2xl shadow-xl animate-bounce text-lg z-50 text-ink flex items-center justify-center">
                    {activeEmote}
                    <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-cream border-l-2 border-b-2 border-line/20 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
