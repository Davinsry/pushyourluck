import { Hand, Milk, Sparkles } from "lucide-react";
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
  onSuap: (bite: BiteId) => void;
  onMinumSusu: () => void;
  onSajikan: () => void;
  readOnly?: boolean; // online: you're watching someone else's turn
  busy?: boolean; // an eat/drink animation is playing — lock the controls
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
  readOnly = false,
  busy = false,
}: Props) {
  const ch = player.char;
  const charDef = ch ? CHARS[ch] : null;
  const curMult = multiplier(heat, ch);

  return (
    <>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="m-0 text-[13px] font-semibold text-muted">Giliran</p>
          <p className="m-0 text-2xl font-extrabold text-chili-dark">{player.name}</p>
          {charDef && (
            <p className="m-0 mt-0.5 text-[13px] font-bold" style={{ color: color(charDef.colorKey) }}>
              {charDef.name}
            </p>
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
      <p className="m-0 mb-2 text-xs font-semibold text-muted">Pilih suapan:</p>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {(Object.entries(BITES) as [BiteId, (typeof BITES)[BiteId]][]).map(([key, b]) => {
          const pointMod = charDef && "pointMod" in charDef ? (charDef.pointMod as number) : 0;
          const heatMod = charDef && "heatMod" in charDef ? (charDef.heatMod as number) : 0;

          const baseMin = b.points[0];
          const baseMax = b.points[1];
          const finalMin = Math.max(1, baseMin + pointMod);
          const finalMax = Math.max(1, baseMax + pointMod);

          const finalHeat = b.heat + heatMod;

          return (
            <button
              key={key}
              className="tp-btn rounded-xl px-1.5 py-3 text-sm font-extrabold leading-snug text-white"
              style={{ background: color(b.colorKey) }}
              onClick={() => onSuap(key)}
              disabled={busy}
            >
              {b.name}
              <span className="mt-0.5 block text-[11px] font-semibold opacity-95">
                +{finalMin}–{finalMax} poin
                {pointMod !== 0 && (
                  <span className="text-[10px] font-medium opacity-80"> ({pointMod > 0 ? `+${pointMod}` : pointMod})</span>
                )}
                <br />
                pedas +{finalHeat}
                {heatMod !== 0 && (
                  <span className="text-[10px] font-medium opacity-80"> (+{heatMod})</span>
                )}
              </span>
            </button>
          );
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
