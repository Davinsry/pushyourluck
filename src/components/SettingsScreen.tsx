import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

interface Props {
  cycles: number;
  muted: boolean;
  onSetCycles: (cycles: number) => void;
  onToggleMute: () => void;
  onBack: () => void;
}

const CYCLE_OPTIONS = [2, 3, 4, 5, 6];

export function SettingsScreen({ cycles, muted, onSetCycles, onToggleMute, onBack }: Props) {
  return (
    <div className="mt-[18px] rounded-[20px] bg-card p-6 text-ink">
      <div className="mb-5 flex items-center gap-2">
        <button className="tp-btn rounded-full bg-cream-2 p-2 text-ink" onClick={onBack} aria-label="Kembali">
          <ArrowLeft size={18} />
        </button>
        <h2 className="m-0 text-xl font-extrabold text-chili-dark">Pengaturan</h2>
      </div>

      <p className="m-0 mb-2 text-[15px] font-semibold text-ink">Ronde per pemain</p>
      <p className="m-0 mb-3 text-[13px] text-muted">Berapa kali tiap pemain dapat giliran.</p>
      <div className="mb-6 flex gap-2">
        {CYCLE_OPTIONS.map((c) => (
          <button
            key={c}
            className={`tp-btn flex-1 rounded-xl py-3 text-lg font-extrabold ${
              cycles === c ? "bg-chili text-white" : "bg-cream-2 text-muted"
            }`}
            onClick={() => onSetCycles(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="m-0 mb-2 text-[15px] font-semibold text-ink">Suara</p>
      <button
        className="tp-btn flex w-full items-center justify-between rounded-xl bg-cream-2 px-4 py-3 text-[15px] font-bold text-ink"
        onClick={onToggleMute}
      >
        <span>{muted ? "Suara mati" : "Suara nyala"}</span>
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}
