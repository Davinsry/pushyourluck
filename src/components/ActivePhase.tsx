import { Hand, Milk, Sparkles, Shield, Eye } from "lucide-react";
import { CHARS, FINAL_MULT } from "../config/balance";
import type { BiteId, Player } from "../game";
import { multiplier } from "../game";
import { color } from "../ui/theme";
import { HeatMeter } from "./HeatMeter";
import { KitBadges } from "./KitBadges";

interface Props {
  player: Player;
  heat: number;
  roundPts: number;
  feedback: string;
  isFinal: boolean;
  onSuap: (bowlIdx: number) => void;
  onMinumSusu: () => void;
  onSajikan: () => void;
  secretBowls: BiteId[];
  readOnly?: boolean; // online: you're watching someone else's turn
  busy?: boolean; // an eat/drink animation is playing — lock the controls
  shieldUsed?: boolean; // Lidah Baja's passive shield used this round
  terawangActive?: boolean; // Is Terawang currently peeking the bowls?
  terawangUsed?: boolean; // Did they use Terawang during the current turn?
  onTerawang?: () => void;
}

export function ActivePhase({
  player,
  heat,
  roundPts,
  feedback,
  isFinal,
  onSuap,
  onMinumSusu,
  onSajikan,
  secretBowls,
  readOnly = false,
  busy = false,
  shieldUsed = false,
  terawangActive = false,
  terawangUsed = false,
  onTerawang,
}: Props) {
  const ch = player.char;
  const charDef = ch ? CHARS[ch] : null;
  const curMult = multiplier(heat, ch, terawangUsed);

  return (
    <>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="m-0 text-[13px] font-semibold text-muted font-bold uppercase tracking-wider">Giliran</p>
          <p className="m-0 text-2xl font-extrabold text-chili-dark">{player.name}</p>
          {charDef && (
            <div className="flex flex-col gap-1 mt-0.5">
              <p className="m-0 text-[13px] font-bold" style={{ color: color(charDef.colorKey) }}>
                {charDef.name}
              </p>
              {ch === "baja" && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-sm ${
                      shieldUsed 
                        ? "bg-stone-200 text-stone-500 line-through" 
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    <Shield size={10} className={shieldUsed ? "text-stone-400" : "text-emerald-600"} />
                    {shieldUsed 
                      ? `Kebal: Tidak Aktif (Sisa: ${player.passiveShields})` 
                      : `Kebal: Aktif (Sisa: ${player.passiveShields})`}
                  </span>
                </div>
              )}
              {ch === "terawang" && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-sm bg-purple-100 text-purple-800 border border-purple-200"
                  >
                    <Eye size={10} className="text-purple-600" />
                    Terawang Sisa: {player.terawangCharges}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <KitBadges player={player} />
      </div>

      {isFinal && (
        <div className="mb-3.5 rounded-[10px] bg-amber py-1.5 text-center text-[13px] font-extrabold text-ink">
          <Sparkles size={14} className="mr-1 inline-block align-[-2px]" /> Ronde pamungkas — semua poin ronde ini ×
          {FINAL_MULT}!
        </div>
      )}

      <HeatMeter heat={heat} />

      <div className="mb-1 flex items-baseline gap-2.5">
        <span className="text-[42px] font-extrabold leading-none">{roundPts}</span>
        <span className="text-[15px] font-semibold text-muted">poin ronde ini</span>
        {curMult > 1 && (
          <span className="ml-auto animate-pop rounded-full bg-leaf px-3 py-1 text-lg font-extrabold text-white">
            ×{curMult}
          </span>
        )}
      </div>
      <p className="m-0 mb-3.5 h-5 text-sm font-bold text-flame">{feedback}</p>

      {readOnly ? (
        <p className="m-0 rounded-xl bg-cream py-4 text-center text-[15px] font-semibold text-muted">
          {player.name} lagi makan... 🌶️
        </p>
      ) : (
        <>
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <p className="m-0 text-xs font-semibold text-muted">Pilih mangkok:</p>
              {charDef && (
                <p className="m-0 mt-0.5 text-[11px] font-bold leading-normal" style={{ color: color(charDef.colorKey) }}>
                  ✨ {charDef.name}: {charDef.up}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((idx) => {
              const bite = secretBowls && secretBowls[idx];
              const isRevealed = terawangActive && bite;
              
              let btnClass = "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-650";
              let content = "?";
              let label = "Tutup";
              
              if (isRevealed) {
                if (bite === "ijo") {
                  btnClass = "bg-emerald-950 border-emerald-600 text-emerald-400";
                  content = "🟢 Ijo";
                  label = "+8 Pedas";
                } else if (bite === "rawit") {
                  btnClass = "bg-amber-950 border-amber-600 text-amber-400";
                  content = "🔥 Rawit";
                  label = "+15 Pedas";
                } else if (bite === "carolina") {
                  btnClass = "bg-red-950 border-red-600 text-red-400 animate-pulse";
                  content = "💀 Reaper";
                  label = "+28 Pedas";
                }
              }

              return (
                <button
                  key={idx}
                  className={`tp-btn rounded-2xl p-2 text-center flex flex-col justify-between items-center min-h-[110px] transition-all border-2 ${btnClass}`}
                  onClick={() => onSuap(idx)}
                  disabled={busy}
                >
                  <span className="text-[10px] font-bold tracking-wider opacity-75 uppercase">Mangkok {idx + 1}</span>
                  
                  <div className="my-1.5 flex flex-col items-center">
                    <span className="text-base font-extrabold">{content}</span>
                  </div>

                  <span className="text-[9px] font-bold opacity-80">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2.5">
            {ch === "terawang" && player.terawangCharges > 0 && !terawangActive && (
              <button
                className="tp-btn flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-purple-700 py-3.5 text-sm font-extrabold text-white"
                onClick={onTerawang}
                disabled={busy}
              >
                <Eye size={17} /> Terawang
              </button>
            )}
            <button
              className="tp-btn flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-steel py-3.5 text-sm font-extrabold text-white"
              onClick={onMinumSusu}
              disabled={player.susu <= 0 || heat <= 0 || busy}
            >
              <Milk size={17} /> Minum susu
            </button>
            <button
              className="tp-btn flex flex-[1.4] items-center justify-center gap-1.5 rounded-[14px] bg-leaf py-3.5 text-[15px] font-extrabold text-white"
              onClick={onSajikan}
              disabled={roundPts === 0 || busy}
            >
              <Hand size={18} /> Sajikan
            </button>
          </div>
        </>
      )}
    </>
  );
}
