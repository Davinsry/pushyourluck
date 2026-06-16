import { Clock, Pause } from "lucide-react";

interface Props {
  secondsLeft: number;
  onPause: () => void;
}

/** Small countdown pill + pause button shown during a timed human turn. */
export function TurnTimer({ secondsLeft, onPause }: Props) {
  const low = secondsLeft <= 5;
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-extrabold ${
          low ? "bg-chili text-white" : "bg-bg2 text-cream"
        }`}
      >
        <Clock size={13} /> {secondsLeft}s
      </span>
      <button className="tp-btn rounded-full bg-bg2 p-1.5 text-cream" onClick={onPause} aria-label="Jeda">
        <Pause size={15} />
      </button>
    </div>
  );
}
