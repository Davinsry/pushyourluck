import { useState } from "react";
import { Dices, Play } from "lucide-react";
import { getRandomName } from "../config/randomNames";

interface Props {
  onStart: (name: string) => void;
  initialName?: string;
}

/** Splash / intro shown on first launch. Tap "Mulai" to reach the menu. */
export function IntroScreen({ onStart, initialName = "" }: Props) {
  const [name, setName] = useState(initialName);

  const handleStart = () => {
    if (!name.trim()) return;
    onStart(name.trim());
  };

  const handleRandomize = () => {
    setName(getRandomName());
  };

  const isFirstTime = !initialName;

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center text-center py-6 pointer-events-none">
      <div 
        className="rounded-[32px] p-8 backdrop-blur-md border border-line/10 shadow-2xl pointer-events-auto max-w-[420px] mx-auto animate-pop flex flex-col gap-4"
        style={{ backgroundColor: "rgba(30, 19, 13, 0.85)" }}
      >
        <h1
          className="font-display text-5xl font-extrabold tracking-tight text-flame leading-tight"
          style={{ textShadow: "3px 3px 0 var(--c-chili-dark)" }}
        >
          Tahan Pedas
        </h1>
        <p className="m-0 text-[15px] font-semibold text-cream/90 leading-relaxed">
          Lomba makan pedas push-your-luck 3D. Makan cabai sebanyak-banyaknya, dapatkan poin melimpah — tapi awas kepedesan dan menyemburkan api ke lawan!
        </p>

        {isFirstTime && (
          <div className="mt-4 text-left">
            <label className="mb-1.5 block text-[13px] font-bold text-cream/75">Nama Kamu</label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={14}
                placeholder="Masukkan nama..."
                className="w-full rounded-xl border border-line/20 bg-cream/90 px-3.5 py-3 text-base font-semibold text-ink outline-none focus:border-flame"
              />
              <button
                type="button"
                onClick={handleRandomize}
                className="tp-btn rounded-xl bg-flame p-3.5 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                title="Acak Nama"
              >
                <Dices size={20} />
              </button>
            </div>
          </div>
        )}

        <button
          className="tp-btn mt-4 flex items-center justify-center gap-2 rounded-2xl bg-flame px-12 py-4 text-xl font-extrabold text-white shadow-2xl border border-chili/25 hover:scale-105 active:scale-95 transition-all duration-150 w-full disabled:opacity-50 disabled:pointer-events-none"
          onClick={handleStart}
          disabled={isFirstTime && !name.trim()}
        >
          <Play size={22} className="fill-white" /> Mulai Bermain
        </button>
      </div>
    </div>
  );
}
