import { Flame, Volume2, VolumeX } from "lucide-react";

interface Props {
  muted: boolean;
  onToggleMute: () => void;
}

export function Header({ muted, onToggleMute }: Props) {
  return (
    <div className="relative text-center">
      <h1
        className="m-0 font-display text-4xl font-extrabold tracking-tight text-flame"
        style={{ textShadow: "2px 2px 0 var(--c-chili-dark)" }}
      >
        <Flame size={30} className="mr-1 inline-block align-[-4px] text-chili" /> Tahan Pedas
      </h1>
      <p className="mt-1 text-sm font-semibold text-muted">Push-your-luck lomba makan pedas</p>
      <button
        className="tp-btn absolute right-0 top-1 rounded-full bg-bg2 p-2 text-cream"
        onClick={onToggleMute}
        aria-label={muted ? "Nyalakan suara" : "Bisukan suara"}
        title={muted ? "Nyalakan suara" : "Bisukan suara"}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
