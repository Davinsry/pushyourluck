import { useState } from "react";
import { Hand, Milk, Sparkles, Shield, Eye } from "lucide-react";
import { BITES, CHARS, FINAL_MULT } from "../config/balance";
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
  onIntipBowl?: (bowlIdx: number) => void;
  onMinumSusu: () => void;
  onSajikan: () => void;
  secretBowls: BiteId[];
  revealedBowls: boolean[];
  readOnly?: boolean; // online: you're watching someone else's turn
  busy?: boolean; // an eat/drink animation is playing — lock the controls
  shieldUsed?: boolean; // Lidah Baja's passive shield used this round
}

export function ActivePhase({
  player,
  heat,
  roundPts,
  feedback,
  isFinal,
  onSuap,
  onIntipBowl,
  onMinumSusu,
  onSajikan,
  secretBowls,
  revealedBowls,
  readOnly = false,
  busy = false,
  shieldUsed = false,
}: Props) {
  const ch = player.char;
  const charDef = ch ? CHARS[ch] : null;
  const curMult = multiplier(heat, ch);
  const [intipActive, setIntipActive] = useState(false);

  // Helper to get modifiers for chilis (for display purposes on revealed chilis)
  const getChiliStats = (key: BiteId) => {
    const b = BITES[key];
    let pointMod = 0;
    if (charDef) {
      const anyCharDef = charDef as any;
      if (anyCharDef.pointModPerChili && key in anyCharDef.pointModPerChili) {
        pointMod = anyCharDef.pointModPerChili[key];
      } else {
        pointMod = anyCharDef.pointMod ?? 0;
      }
    }
    let heatMod = 0;
    if (charDef) {
      const anyCharDef = charDef as any;
      if (anyCharDef.heatModPerChili && key in anyCharDef.heatModPerChili) {
        heatMod = anyCharDef.heatModPerChili[key];
      } else {
        heatMod = anyCharDef.heatMod ?? 0;
      }
    }

    const baseMin = b.points[0];
    const baseMax = b.points[1];
    const finalMin = Math.max(1, baseMin + pointMod);
    const finalMax = Math.max(1, baseMax + pointMod);
    const finalHeat = b.heat + heatMod;

    return { name: b.name, min: finalMin, max: finalMax, heat: finalHeat, colorKey: b.colorKey };
  };

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
            
            {/* Toggle Mode Intip */}
            {player.tameng > 0 && (
              <button
                type="button"
                className={`tp-btn flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold transition-all border ${
                  intipActive
                    ? "bg-amber border-amber-400 text-ink shadow-sm scale-102"
                    : "bg-cream-2 border-line/10 text-muted"
                }`}
                onClick={() => setIntipActive((prev) => !prev)}
                disabled={busy}
              >
                <Shield size={12} className={intipActive ? "text-ink animate-pulse" : "text-muted"} />
                Mode Intip: {intipActive ? "AKTIF" : "MATI"}
              </button>
            )}
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((idx) => {
              const isRevealed = revealedBowls[idx];
              const chiliType = secretBowls[idx];
              
              if (isRevealed && chiliType) {
                const stats = getChiliStats(chiliType);
                return (
                  <button
                    key={idx}
                    className="tp-btn rounded-2xl p-2 text-center text-white flex flex-col justify-between items-center min-h-[110px] transition-all border-2 border-transparent scale-102 shadow-md relative overflow-hidden"
                    style={{ background: color(stats.colorKey) }}
                    onClick={() => {
                      onSuap(idx);
                    }}
                    disabled={busy}
                  >
                    <span className="absolute top-1 right-1 bg-white/25 rounded-full p-0.5" title="Terungkap">
                      <Eye size={10} className="text-white" />
                    </span>

                    <span className="text-[10px] font-bold tracking-wider opacity-85 uppercase">Mangkok {idx + 1}</span>
                    <span className="text-sm font-black leading-snug mt-1">{stats.name}</span>
                    <span className="mt-2 text-[10px] font-semibold opacity-95 leading-normal">
                      +{stats.min}–{stats.max} poin
                      <br />
                      pedas +{stats.heat}
                    </span>
                  </button>
                );
              } else {
                return (
                  <button
                    key={idx}
                    className={`tp-btn rounded-2xl p-2 text-center flex flex-col justify-between items-center min-h-[110px] transition-all border-2 ${
                      intipActive
                        ? "bg-amber/15 border-amber-300 hover:bg-amber/25 text-amber-900"
                        : "bg-slate-700 border-slate-600 hover:bg-slate-650 text-slate-100"
                    }`}
                    onClick={() => {
                      if (intipActive) {
                        if (onIntipBowl) onIntipBowl(idx);
                      } else {
                        onSuap(idx);
                      }
                    }}
                    disabled={busy}
                  >
                    <span className="text-[10px] font-bold tracking-wider opacity-75 uppercase">Mangkok {idx + 1}</span>
                    
                    <div className="my-1.5 flex flex-col items-center">
                      <span className="text-xl font-bold">?</span>
                      {intipActive && (
                        <span className="text-[9px] font-black uppercase tracking-wide mt-0.5 text-amber-800">
                          Intip (−1🛡️)
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold opacity-75">Tutup</span>
                  </button>
                );
              }
            })}
          </div>

          <div className="flex gap-2.5">
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
