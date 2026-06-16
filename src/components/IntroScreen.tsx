import { Play } from "lucide-react";

interface Props {
  onStart: () => void;
}

/** Splash / intro shown on first launch. Tap "Mulai" to reach the menu. */
export function IntroScreen({ onStart }: Props) {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center text-center py-6 pointer-events-none">
      <div 
        className="rounded-[32px] p-8 backdrop-blur-md border border-line/10 shadow-2xl pointer-events-auto max-w-[420px] mx-auto animate-pop"
        style={{ backgroundColor: "rgba(30, 19, 13, 0.85)" }}
      >
        <h1
          className="font-display text-5xl font-extrabold tracking-tight text-flame leading-tight"
          style={{ textShadow: "3px 3px 0 var(--c-chili-dark)" }}
        >
          Tahan Pedas
        </h1>
        <p className="mt-4 text-[15px] font-semibold text-cream/90 leading-relaxed">
          Lomba makan pedas push-your-luck 3D. Makan cabai sebanyak-banyaknya, dapatkan poin melimpah — tapi awas kepedesan dan menyemburkan api ke lawan!
        </p>
        <button
          className="tp-btn mt-8 flex items-center justify-center gap-2 rounded-2xl bg-flame px-12 py-4 text-xl font-extrabold text-white shadow-2xl border border-chili/25 hover:scale-105 active:scale-95 transition-all duration-150 w-full"
          onClick={onStart}
        >
          <Play size={22} className="fill-white" /> Mulai Bermain
        </button>
      </div>
    </div>
  );
}
