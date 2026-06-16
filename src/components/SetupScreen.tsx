import { ArrowLeft, Bot, Play, Users } from "lucide-react";
import type { Mode, Player } from "../game";

interface Props {
  players: Player[];
  mode: Mode;
  onSetCount: (count: number) => void;
  onRename: (index: number, name: string) => void;
  onStart: () => void;
  onBack: () => void;
}

export function SetupScreen({ players, mode, onSetCount, onRename, onStart, onBack }: Props) {
  const n = players.length;
  const solo = mode === "solo";

  return (
    <div className="mt-[18px] animate-pop rounded-[20px] bg-card p-6 text-ink">
      <div className="mb-3.5 flex items-center gap-2">
        <button className="tp-btn rounded-full bg-cream-2 p-2 text-ink" onClick={onBack} aria-label="Kembali">
          <ArrowLeft size={18} />
        </button>
        <p className="m-0 text-[15px] font-semibold text-chili-dark">
          <Users size={17} className="mr-1.5 inline-block align-[-3px]" />
          {solo ? "Kamu + jumlah bot" : "Jumlah pemain"}
        </p>
      </div>

      <div className="mb-5 flex gap-2.5">
        {[2, 3, 4].map((c) => (
          <button
            key={c}
            className={`tp-btn flex-1 rounded-[14px] py-3.5 text-xl font-extrabold ${
              n === c ? "bg-chili text-white" : "bg-cream-2 text-muted"
            }`}
            onClick={() => onSetCount(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mb-[22px] grid gap-2.5">
        {players.map((p, i) =>
          p.isBot ? (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border-[1.5px] border-line bg-cream-2 px-3.5 py-3 text-base font-semibold text-muted"
            >
              <Bot size={18} /> {p.name}
            </div>
          ) : (
            <input
              key={i}
              value={p.name}
              onChange={(e) => onRename(i, e.target.value)}
              maxLength={14}
              className="rounded-xl border-[1.5px] border-line bg-cream px-3.5 py-3 text-base font-semibold text-ink outline-none"
            />
          )
        )}
      </div>

      <button
        className="tp-btn flex w-full items-center justify-center gap-2 rounded-[14px] bg-flame py-4 text-[19px] font-extrabold text-white"
        onClick={onStart}
      >
        <Play size={20} /> Pilih karakter
      </button>
    </div>
  );
}
