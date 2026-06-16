import { LogOut } from "lucide-react";
import { activeIndex, currentCycle, isFinalRonde, totalTurns } from "../../game";
import type { UseRoom } from "../../net/useRoom";
import { DraftScreen } from "../DraftScreen";
import { Scoreboard } from "../Scoreboard";
import { PreturnPhase } from "../PreturnPhase";
import { ActivePhase } from "../ActivePhase";
import { ResultPhase } from "../ResultPhase";
import { GameOverScreen } from "../GameOverScreen";

interface Props {
  room: UseRoom;
  onExit: () => void;
}

/** Renders the synced online game from the server's authoritative state. */
export function OnlinePlay({ room, onExit }: Props) {
  const state = room.gameState!;
  const youSeat = room.youSeat;
  const send = room.sendAction;
  const ai = activeIndex(state);

  return (
    <>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[13px] font-bold text-muted">
          Room <span className="tracking-[0.15em] text-cream">{room.code}</span>
        </span>
        <button className="tp-btn flex items-center gap-1.5 rounded-full bg-bg2 px-3 py-1.5 text-xs font-bold text-cream" onClick={onExit}>
          <LogOut size={14} /> Keluar
        </button>
      </div>

      {state.screen === "draft" && (
        <DraftScreen
          players={state.players}
          draftIdx={state.draftIdx}
          options={state.draftOpts}
          onChoose={(char) => send({ type: "CHOOSE_CHAR", char })}
          locked={state.draftIdx !== youSeat}
        />
      )}

      {state.screen === "play" && (
        <>
          <Scoreboard
            players={state.players}
            activeIndex={ai}
            cycle={currentCycle(state)}
            cycles={state.settings.cycles}
            isFinal={isFinalRonde(state)}
          />
          <div className="rounded-[20px] bg-card p-6 text-ink">
            {state.phase === "preturn" && (
              <PreturnPhase
                players={state.players}
                activeIndex={ai}
                bets={state.bets}
                usedSabo={state.usedSabo}
                pendingHeat={state.pendingHeat}
                blockAsk={state.blockAsk}
                viewerSeat={youSeat}
                onToggleBet={(player, bet) => send({ type: "TOGGLE_BET", player, bet })}
                onAddSabo={(player) => send({ type: "ADD_SABO", player })}
                onConfirm={() => send({ type: "CONFIRM_PRETURN" })}
                onUseTameng={() => send({ type: "USE_TAMENG" })}
                onAcceptHeat={() => send({ type: "ACCEPT_HEAT" })}
              />
            )}

            {state.phase === "active" && (
              <ActivePhase
                player={state.players[ai]}
                heat={state.heat}
                roundPts={state.roundPts}
                feedback={state.feedback}
                isFinal={isFinalRonde(state)}
                readOnly={youSeat !== ai}
                onSuap={(bite) => send({ type: "SUAP", bite })}
                onMinumSusu={() => send({ type: "MINUM_SUSU" })}
                onSajikan={() => send({ type: "SAJIKAN" })}
              />
            )}

            {state.phase === "result" && state.outcome && (
              <ResultPhase
                outcome={state.outcome}
                playerName={state.players[ai].name}
                isLastTurn={state.turn + 1 >= totalTurns(state)}
                canAdvance={youSeat === ai}
                onNext={() => send({ type: "NEXT" })}
              />
            )}
          </div>
        </>
      )}

      {state.screen === "gameover" && <GameOverScreen players={state.players} onReset={onExit} />}
    </>
  );
}
