import { BookOpen, Settings, Users } from "lucide-react";
import type { Mode } from "../game";

interface Props {
  onPickMode: (mode: Mode) => void;
  onSettings: () => void;
  onTutorial: () => void;
}

/** Main menu: local pass-and-play, how-to-play, settings. */
export function MenuScreen({ onPickMode, onSettings, onTutorial }: Props) {
  return (
    <div className="mt-[18px] grid gap-3">
      <MenuButton
        icon={<Users size={26} />}
        title="Main Bareng"
        subtitle="Pass-and-play 2–4 orang di satu perangkat"
        color="var(--c-flame)"
        onClick={() => onPickMode("local")}
      />
      <MenuButton
        icon={<BookOpen size={26} />}
        title="Cara Main"
        subtitle="Aturan & tutorial dari awal sampai akhir"
        color="var(--c-amber)"
        onClick={onTutorial}
      />
      <MenuButton
        icon={<Settings size={26} />}
        title="Pengaturan"
        subtitle="Nama & suara"
        color="var(--c-steel)"
        onClick={onSettings}
      />
    </div>
  );
}

interface ButtonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}

function MenuButton({ icon, title, subtitle, color, onClick }: ButtonProps) {
  return (
    <button
      className="tp-btn flex items-center gap-4 rounded-2xl bg-card p-5 text-left"
      style={{ borderLeft: `6px solid ${color}` }}
      onClick={onClick}
    >
      <span style={{ color }}>{icon}</span>
      <div>
        <div className="text-lg font-extrabold text-ink">{title}</div>
        <div className="text-[13px] font-semibold text-muted">{subtitle}</div>
      </div>
    </button>
  );
}
