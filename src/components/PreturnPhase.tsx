import { useState, useEffect } from "react";
import { Coins, Shield } from "lucide-react";
import { BET_STAKE } from "../config/balance";
import type { Bet, BetMap, Player } from "../game";

interface Props {
  players: Player[];
  activeIndex: number;
  bets: BetMap;
  onToggleBet: (player: number, bet: Bet) => void;
  onConfirm: () => void;
  viewerSeat?: number; // online: which seat is looking (gates controls)
  passiveShieldActivated?: boolean;
  onTogglePassiveShield?: () => void;
}

export function PreturnPhase({
  players,
  activeIndex,
  bets,
  onToggleBet,
  onConfirm,
  viewerSeat,
  passiveShieldActivated,
  onTogglePassiveShield,
}: Props) {
  const me = players[activeIndex];
  const hasHumanSpectators = players.some((p, k) => k !== activeIndex && !p.isBot);
  const online = viewerSeat !== undefined;
  const youAreActive = !online || viewerSeat === activeIndex;

  const [showPassiveShieldModal, setShowPassiveShieldModal] = useState(false);

  // Toggle body class when modal open to prevent 3D floating badges from bleeding through
  useEffect(() => {
    if (showPassiveShieldModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showPassiveShieldModal]);

  return (
    <div className="animate-pop">
      <p className="m-0 text-[13px] font-semibold text-muted font-bold uppercase tracking-wider">
        Mulai Giliran
      </p>
      <p className="m-0 mb-1 text-2xl font-extrabold text-chili-dark">{me.name}</p>
      <p className="m-0 mb-3 text-[13px] text-ink">
        {hasHumanSpectators
          ? `Penonton: tebak nasib ${me.name} (benar +${BET_STAKE}, salah −${BET_STAKE}).`
          : `Lawan-lawan bot diam-diam pasang taruhan...`}
      </p>

      <div className="mb-3.5 grid gap-2.5">
        {players.map((p, k) => {
          if (k === activeIndex || p.isBot) return null;
          if (online && k !== viewerSeat) return null; // online: only bet for yourself
          return (
            <div key={k} className="rounded-xl border-[1.5px] border-cream-2 bg-cream px-3 py-2.5">
              <div className="mb-2 text-sm font-bold">{p.name}</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  className={`tp-btn rounded-full px-3 py-1.5 text-[13px] font-bold ${
                    bets[k] === "aman" ? "bg-leaf text-white" : "bg-cream-2 text-muted"
                  }`}
                  onClick={() => onToggleBet(k, "aman")}
                >
                  <Coins size={13} className="mr-1 inline-block align-[-2px]" />
                  Aman
                </button>
                <button
                  className={`tp-btn rounded-full px-3 py-1.5 text-[13px] font-bold ${
                    bets[k] === "bust" ? "bg-chili text-white" : "bg-cream-2 text-muted"
                  }`}
                  onClick={() => onToggleBet(k, "bust")}
                >
                  <Coins size={13} className="mr-1 inline-block align-[-2px]" />
                  Kepedesan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {youAreActive ? (
        <button
          className="tp-btn w-full rounded-[14px] bg-flame py-3.5 text-[17px] font-extrabold text-white"
          onClick={() => {
            if (me.char === "baja" && me.passiveShields > 0 && !me.isBot) {
              setShowPassiveShieldModal(true);
            } else {
              onConfirm();
            }
          }}
        >
          Mulai giliran {me.name}
        </button>
      ) : (
        <p className="m-0 rounded-xl bg-cream py-3 text-center text-[14px] font-semibold text-muted">
          Menunggu {me.name} mulai...
        </p>
      )}

      {/* Passive Shield Confirmation Modal */}
      {showPassiveShieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[340px] transform rounded-3xl bg-cream p-6 border-2 border-line/20 shadow-2xl text-ink relative flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="m-0 text-lg font-black text-chili-dark flex items-center justify-center gap-1.5">
                <Shield size={20} className="text-steel" /> Gunakan Tameng Kebal?
              </h3>
              <p className="m-0 text-xs text-muted font-semibold mt-1">
                Karakter: <span className="text-steel font-bold">Si Lidah Baja</span> (Sisa: {me.passiveShields})
              </p>
            </div>
            
            <p className="m-0 text-sm text-ink leading-relaxed text-center font-medium">
              Apakah kamu ingin mengaktifkan <strong>1 Tameng Kebal</strong> untuk ronde ini?
            </p>
            
            <div className="rounded-2xl bg-cream-2/70 border border-line/5 p-3 text-xs text-muted leading-normal">
              <p className="m-0 mb-1 font-bold text-ink">💡 Cara Kerja:</p>
              <ul className="m-0 pl-4 list-disc space-y-1">
                <li>Melindungi otomatis dari <strong>kepedesan (Bust) pertama</strong> ronde ini.</li>
                <li>Jika kamu selesai makan tanpa Bust, tameng <strong>tetap hangus</strong>.</li>
              </ul>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button
                className="tp-btn flex-1 rounded-xl bg-flame py-3 text-sm font-extrabold text-white hover:scale-102 transition-transform"
                onClick={() => {
                  if (!passiveShieldActivated && onTogglePassiveShield) {
                    onTogglePassiveShield();
                  }
                  setShowPassiveShieldModal(false);
                  onConfirm();
                }}
              >
                Ya, Aktifkan
              </button>
              <button
                className="tp-btn flex-1 rounded-xl bg-cream-2 py-3 text-sm font-extrabold text-ink hover:bg-cream-3 transition-colors"
                onClick={() => {
                  if (passiveShieldActivated && onTogglePassiveShield) {
                    onTogglePassiveShield();
                  }
                  setShowPassiveShieldModal(false);
                  onConfirm();
                }}
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

