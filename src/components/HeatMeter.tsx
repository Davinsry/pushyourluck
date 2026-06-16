import { Flame } from "lucide-react";
import { bustChance } from "../game";
import { heatColor } from "../ui/theme";

interface Props {
  heat: number;
}

/** The "Level pedas" bar + live bust-chance readout. */
export function HeatMeter({ heat }: Props) {
  const c = heatColor(heat);
  return (
    <>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">
          <Flame size={16} className="mr-1 inline-block align-[-3px]" style={{ color: c }} /> Level pedas
        </span>
        <span className="text-sm font-bold text-chili-dark">Peluang kepedesan: {bustChance(heat)}%</span>
      </div>
      <div className="mb-[18px] h-4 overflow-hidden rounded-full bg-cream-2">
        <div
          className="h-full transition-[width,background] duration-300"
          style={{ width: `${Math.min(100, heat)}%`, background: c }}
        />
      </div>
    </>
  );
}
