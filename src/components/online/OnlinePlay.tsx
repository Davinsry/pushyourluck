import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { activeIndex, currentCycle, isFinalRonde, totalTurns } from "../../game";
import type { UseRoom } from "../../net/useRoom";
import { DraftScreen } from "../DraftScreen";
import { Scoreboard } from "../Scoreboard";
import { PreturnPhase } from "../PreturnPhase";
import { ActivePhase } from "../ActivePhase";
import { ResultPhase } from "../ResultPhase";
import { GameOverScreen } from "../GameOverScreen";
import { TurnTimer } from "../TurnTimer";
import { EMOTES } from "../../config/emotes";

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

  const limit = state.settings.turnTimerLimit ?? 0;
  const [secondsLeft, setSecondsLeft] = useState(limit);

  // Reset the timer when active turn, phase, or limit changes
  useEffect(() => {
    if (state.phase === "active" && limit > 0) {
      setSecondsLeft(limit);
    } else if (state.phase === "preturn") {
      setSecondsLeft(30);
    }
  }, [state.turn, state.phase, limit]);

  // Tick the countdown
  useEffect(() => {
    if (state.phase !== "active" && state.phase !== "preturn") return;
    if (state.phase === "active" && limit <= 0) return;

    const phaseLimit = state.phase === "active" ? limit : 30;

    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (state.phase === "active") {
            if (youSeat === ai) {
              send({ type: "SKIP_TURN" });
            }
            if (room.isHost && youSeat !== ai) {
              if (s === 1) return 0;
            } else {
              return limit;
            }
          } else if (state.phase === "preturn") {
            if (youSeat === ai) {
              send({ type: "CONFIRM_PRETURN" });
            }
            if (room.isHost && youSeat !== ai) {
              if (s === 1) return 0;
            } else {
              return 30;
            }
          }
        }

        if (s <= 0) {
          if (room.isHost && youSeat !== ai) {
            if (s <= -3) {
              if (state.phase === "active") {
                room.sendAction({ type: "SKIP_TURN" });
                return limit;
              } else if (state.phase === "preturn") {
                room.sendAction({ type: "CONFIRM_PRETURN" });
                return 30;
              }
            }
            return s - 1;
          }
          return phaseLimit;
        }

        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [state.phase, youSeat, ai, limit, send, room.isHost, room.sendAction]);

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
          {/* Emote Panel (Middle Right) */}
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 bg-bg2/95 border border-line/10 p-2 rounded-2xl shadow-xl backdrop-blur-md">
            <span className="text-[9px] uppercase tracking-wider text-muted font-bold text-center mb-1">Emote</span>
            {EMOTES.map(({ id, emoji, label }) => (
              <button
                key={id}
                onClick={() => room.sendEmote(id)}
                className="tp-btn h-10 w-10 text-xl rounded-xl bg-cream-2 hover:bg-cream hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex gap-4 items-start mb-4">
            <div className="flex-1">
              <Scoreboard
                players={state.players}
                activeIndex={ai}
                cycle={currentCycle(state)}
                cycles={state.settings.cycles}
                isFinal={isFinalRonde(state)}
                activeEmotes={room.activeEmotes}
              />
            </div>
            {((state.phase === "active" && limit > 0) || state.phase === "preturn") && (
              <div className="flex flex-col items-center justify-center p-4 rounded-[20px] bg-bg2/90 border border-line/10 shadow-lg backdrop-blur-md text-cream min-w-[105px]">
                <span className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1.5">Sisa Waktu</span>
                <TurnTimer secondsLeft={Math.max(0, secondsLeft)} onPause={undefined} />
              </div>
            )}
          </div>
          
          <div className="rounded-[20px] bg-card p-6 text-ink">
            {state.phase === "preturn" && (
              <PreturnPhase
                players={state.players}
                activeIndex={ai}
                bets={state.bets}
                viewerSeat={youSeat}
                onToggleBet={(player, bet) => send({ type: "TOGGLE_BET", player, bet })}
                onSetBetAmount={(player, amount) => send({ type: "SET_BET_AMOUNT", player, amount })}
                onConfirm={() => send({ type: "CONFIRM_PRETURN" })}
                passiveShieldActivated={state.passiveShieldActivated}
                onTogglePassiveShield={() => send({ type: "TOGGLE_PASSIVE_SHIELD" })}
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
                secretBowls={state.secretBowls}
                onSuap={(bowlIdx) => send({ type: "SUAP", bowlIdx })}
                onMinumSusu={() => send({ type: "MINUM_SUSU" })}
                onSajikan={() => send({ type: "SAJIKAN" })}
                shieldUsed={state.shieldUsed}
                terawangActive={state.terawangActive}
                terawangUsed={state.terawangUsed}
                onTerawang={() => send({ type: "TERAWANG" })}
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
