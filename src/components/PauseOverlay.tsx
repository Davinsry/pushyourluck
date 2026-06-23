import { Home, Play, RotateCcw } from "lucide-react";

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

/** Full-screen pause menu. The turn timer is frozen while this is open. */
export function PauseOverlay({ onResume, onRestart, onMenu }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(30,19,13,0.82)" }}
    >
      <div className="w-full max-w-[360px] rounded-[20px] bg-card p-6 text-center text-ink">
        <h2 className="m-0 mb-4 text-2xl font-extrabold text-chili-dark">Jeda</h2>
        <div className="grid gap-2.5">
          <button
            className="tp-btn flex items-center justify-center gap-2 rounded-xl bg-flame py-3.5 text-[17px] font-extrabold text-white"
            onClick={onResume}
          >
            <Play size={19} /> Lanjut main
          </button>
          <button
            className="tp-btn flex items-center justify-center gap-2 rounded-xl bg-steel py-3 text-[15px] font-extrabold text-white"
            onClick={onRestart}
          >
            <RotateCcw size={17} /> Restart
          </button>
          <button
            className="tp-btn flex items-center justify-center gap-2 rounded-xl bg-cream-2 py-3 text-[15px] font-extrabold text-ink"
            onClick={onMenu}
          >
            <Home size={17} /> Menu utama
          </button>
        </div>
      </div>
    </div>
  );
}
