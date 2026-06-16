import { BookOpen, Bot, Settings, Users, Wifi } from "lucide-react";
import type { Mode } from "../game";

interface Props {
  onPickMode: (mode: Mode) => void;
  onSettings: () => void;
  onTutorial: () => void;
  onOnline: () => void;
}

/** Main menu: solo (vs bot), local multiplayer, settings, online rooms. */
export function MenuScreen({ onPickMode, onSettings, onTutorial, onOnline }: Props) {
  return (
    <div className="mt-[18px] grid gap-3">
      <MenuButton
        icon={<Bot size={26} />}
        title="Main Sendiri"
        subtitle="Lawan bot — latihan & seru-seruan solo"
        color="var(--c-chili)"
        onClick={() => onPickMode("solo")}
      />
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
        subtitle="Jumlah ronde & suara"
        color="var(--c-steel)"
        onClick={onSettings}
      />
      <MenuButton
        icon={<Wifi size={26} />}
        title="Main Online"
        subtitle="Buat / join room bareng teman"
        color="var(--c-leaf)"
        onClick={onOnline}
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
