import { FlameKindling, Sparkles } from "lucide-react";
import { CHARS } from "../config/balance";
import type { CharacterId, Player } from "../game";
import { color } from "../ui/theme";

interface Props {
  players: Player[];
  draftIdx: number;
  options: CharacterId[];
  onChoose: (char: CharacterId) => void;
  locked?: boolean; // online: it's another player's turn to draft
}

export function DraftScreen({ players, draftIdx, options, onChoose, locked = false }: Props) {
  const n = players.length;
  const current = players[draftIdx];
  const isBot = current.isBot || locked;
  return (
    <div className="mt-[18px]">
      <p className="m-0 mb-1 text-center text-sm font-semibold text-muted">
        Pilih bebas dari {options.length} sisa — pemain {draftIdx + 1} / {n}
      </p>
      <p className="m-0 mb-[18px] text-center text-2xl font-extrabold text-flame">
        {isBot ? `${current.name} lagi milih...` : `${current.name}, pilih karaktermu`}
      </p>
      <div className={`grid gap-3 ${isBot ? "pointer-events-none opacity-70" : ""}`}>
        {options.map((key) => {
          const k = CHARS[key];
          const c = color(k.colorKey);
          return (
            <button
              key={key}
              className="tp-btn rounded-[18px] bg-card p-5 text-left"
              style={{ borderTop: `5px solid ${c}` }}
              onClick={() => onChoose(key)}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl font-extrabold text-ink">{k.name}</span>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: c }}>
                  {k.tag}
                </span>
              </div>
              <p className="m-0 mb-1 text-sm font-semibold text-leaf-dark">
                <Sparkles size={14} className="mr-1 inline-block align-[-2px]" /> {k.up}
              </p>
              <p className="m-0 text-sm text-chili-dark">
                <FlameKindling size={14} className="mr-1 inline-block align-[-2px]" /> {k.down}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
