import { CheckCheck, Flame } from "lucide-react";
import { BET_STAKE, FINAL_MULT } from "../config/balance";
import type { Outcome } from "../game";

interface Props {
  outcome: Outcome;
  playerName: string;
  isLastTurn: boolean;
  onNext: () => void;
  canAdvance?: boolean; // online: only the active player advances
}

export function ResultPhase({ outcome, playerName, isLastTurn, onNext, canAdvance = true }: Props) {
  const { busted, gained, raw, mult, hematBonus, final, bets } = outcome;

  return (
    <div className="animate-pop py-1 text-center">
      {busted ? (
        <>
          <Flame size={46} className="mx-auto text-chili" />
          <p className="my-1.5 mb-1 text-[27px] font-extrabold text-chili-dark">Kepedesan!</p>
          <p className="m-0 text-[15px] text-muted">{playerName} kepedesan. Poin ronde hangus.</p>
        </>
      ) : (
        <>
          <CheckCheck size={46} className="mx-auto text-leaf" />
          <p className="my-1.5 mb-1 text-[27px] font-extrabold text-leaf">Aman!</p>
          <p className="m-0 text-[15px] font-semibold text-ink">
            {mult > 1 ? `${raw} × ${mult}` : `${raw}`}
            {hematBonus ? ` + ${hematBonus}` : ""}
            {final ? ` × ${FINAL_MULT}` : ""} = <span className="font-extrabold text-chili-dark">{gained} poin</span>
          </p>
        </>
      )}

      {bets.length > 0 && (
        <div className="mx-auto mt-3 grid max-w-[320px] gap-1 text-left">
          {bets.map((b, i) => (
            <div
              key={i}
              className={`text-[13px] font-semibold ${b.correct ? "text-leaf-dark" : "text-chili-dark"}`}
            >
              {b.name} tebak "{b.bet === "bust" ? "kepedesan" : "aman"}" →{" "}
              {b.correct ? `benar +${BET_STAKE}` : `salah ${b.delta}`}
            </div>
          ))}
        </div>
      )}

      {canAdvance ? (
        <button
          className="tp-btn mt-4 rounded-[14px] bg-flame px-10 py-3 text-[17px] font-extrabold text-white"
          onClick={onNext}
        >
          {isLastTurn ? "Lihat hasil" : "Lanjut"}
        </button>
      ) : (
        <p className="m-0 mt-4 text-[13px] font-semibold text-muted">Menunggu {playerName} lanjut...</p>
      )}
    </div>
  );
}
