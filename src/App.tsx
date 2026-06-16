import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useGame } from "./hooks/useGame";
import { useSound } from "./hooks/useSound";
import type { BiteId } from "./game";
import { botActiveDecision, botBlockDecision, botSpectatorActions } from "./game";
import { ACTION_ANIM_MS, BOT, TURN_SECONDS } from "./config/balance";
import type { ActionAnim } from "./three/GameScene";
import { Header } from "./components/Header";
import { IntroScreen } from "./components/IntroScreen";
import { MenuScreen } from "./components/MenuScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { TutorialScreen } from "./components/TutorialScreen";
import { SetupScreen } from "./components/SetupScreen";
import { DraftScreen } from "./components/DraftScreen";
import { ShopScreen } from "./components/ShopScreen";
import { PauseOverlay } from "./components/PauseOverlay";
import { TurnTimer } from "./components/TurnTimer";
import { Scoreboard } from "./components/Scoreboard";
import { GameOverScreen } from "./components/GameOverScreen";
import { Hud3D } from "./components/Hud3D";
import { useRoom } from "./net/useRoom";
import { OnlineLobby } from "./components/online/OnlineLobby";
import { WaitingRoom } from "./components/online/WaitingRoom";
import { OnlinePlay } from "./components/online/OnlinePlay";

// The whole 3D layer (three.js) is code-split so the 2D game loads fast and
// devices that never open 3D never pay for it.
const GameScene = lazy(() => import("./three/GameScene").then((m) => ({ default: m.GameScene })));
const LobbyScene = lazy(() => import("./three/LobbyScene").then((m) => ({ default: m.LobbyScene })));

export default function App() {
  const game = useGame();
  const { state, dispatch, activeIndex, cycle, isFinal, totalTurns, activePlayer } = game;
  const { play, muted, toggleMute } = useSound();
  const [online, setOnline] = useState(false);
  const room = useRoom();

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio("/lobby-music.mp3");
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.35;
    }

    const music = bgMusicRef.current;
    const isLobby = state.screen !== "play" && !room.gameState;

    if (isLobby && !muted) {
      music.play().catch(() => {
        // Fallback for browser autoplay policies: play on first click/touch
        const playOnInteraction = () => {
          music.play().catch(() => {});
          window.removeEventListener("click", playOnInteraction);
          window.removeEventListener("touchstart", playOnInteraction);
        };
        window.addEventListener("click", playOnInteraction);
        window.addEventListener("touchstart", playOnInteraction);
      });
    } else {
      music.pause();
    }

    return () => {
      music.pause();
    };
  }, [state.screen, room.gameState, muted]);

  // While an eat/drink animation plays, lock the controls so the player has to
  // wait for the hand to finish before acting again. `anim` drives the 3D hand.
  const [busy, setBusy] = useState(false);
  const [anim, setAnim] = useState<ActionAnim | null>(null);
  const busyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pause + per-turn countdown (local/solo only; online is host-driven).
  const [paused, setPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TURN_SECONDS);
  const isHumanActiveTurn = state.screen === "play" && state.phase === "active" && !activePlayer?.isBot;

  // Restart the countdown whenever a human's eating turn begins.
  useEffect(() => {
    if (isHumanActiveTurn) setSecondsLeft(TURN_SECONDS);
  }, [state.turn, state.phase, isHumanActiveTurn]);

  // Tick the countdown; running out skips the turn.
  useEffect(() => {
    if (!isHumanActiveTurn || paused) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          dispatch({ type: "SKIP_TURN" });
          return TURN_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isHumanActiveTurn, paused, dispatch]);

  // Outcome / game-over SFX are driven by state transitions so we don't have
  // to guess the post-dispatch result synchronously.
  useEffect(() => {
    if (state.phase === "result" && state.outcome) {
      play(state.outcome.busted ? "bust" : "bank");
    }
  }, [state.phase, state.outcome, play]);

  useEffect(() => {
    if (state.screen === "gameover") play("win");
  }, [state.screen, play]);

  // ── Bot driver (solo mode): schedules one bot action at a time on a timer
  // so the moves are watchable. Pure decisions live in src/game/bot.ts.
  const spectatorsDoneTurn = useRef(-1);
  useEffect(() => {
    if (paused) return;
    if (state.screen !== "play") {
      spectatorsDoneTurn.current = -1;
      return;
    }
    // Bot spectators place their bets/sabotage once when a turn's preturn opens.
    if (state.phase === "preturn" && !state.blockAsk && spectatorsDoneTurn.current !== state.turn) {
      spectatorsDoneTurn.current = state.turn;
      const acts = botSpectatorActions(state, Math.random);
      if (acts.length) {
        const t = setTimeout(() => {
          acts.forEach((a) => {
            if (a.type === "ADD_SABO") play("sabotage");
            dispatch(a);
          });
        }, BOT.stepDelayMs);
        return () => clearTimeout(t);
      }
    }
    // A sabotaged bot decides whether to shield.
    if (state.phase === "preturn" && state.blockAsk && activePlayer.isBot) {
      const t = setTimeout(() => dispatch(botBlockDecision(state)), BOT.stepDelayMs);
      return () => clearTimeout(t);
    }
    // A bot's eating turn: one decision per tick until it banks or busts.
    if (state.phase === "active" && activePlayer.isBot) {
      const t = setTimeout(() => {
        const a = botActiveDecision(state);
        if (a.type === "SUAP") play("bite");
        else if (a.type === "MINUM_SUSU") play("milk");
        dispatch(a);
      }, BOT.stepDelayMs);
      return () => clearTimeout(t);
    }
    // After a bot finishes its turn, auto-advance the result screen.
    if (state.phase === "result" && activePlayer.isBot) {
      const t = setTimeout(() => dispatch({ type: "NEXT" }), BOT.stepDelayMs * 1.6);
      return () => clearTimeout(t);
    }
  }, [state, activePlayer, dispatch, play, paused]);

  // Bots draft their own character (solo mode).
  useEffect(() => {
    if (paused || state.screen !== "draft") return;
    const drafting = state.players[state.draftIdx];
    if (!drafting?.isBot) return;
    const t = setTimeout(() => {
      const pick = state.draftOpts[Math.floor(Math.random() * state.draftOpts.length)];
      play("click");
      dispatch({ type: "CHOOSE_CHAR", char: pick });
    }, BOT.stepDelayMs);
    return () => clearTimeout(t);
  }, [state.screen, state.draftIdx, state.players, state.draftOpts, dispatch, play, paused]);

  // Run an action behind a hand animation: lock controls, play the gesture,
  // then apply the action when the hand finishes.
  const animateThen = (kind: "bite" | "milk", bite: BiteId | undefined, run: () => void) => {
    if (busy) return;
    setBusy(true);
    setAnim({ kind, bite, nonce: performance.now() });
    play(kind === "milk" ? "milk" : "bite");
    busyTimer.current = setTimeout(() => {
      run();
      setBusy(false);
      setAnim(null);
    }, ACTION_ANIM_MS);
  };

  const suap = (bite: BiteId) => animateThen("bite", bite, () => dispatch({ type: "SUAP", bite }));
  const minum = () => animateThen("milk", undefined, () => dispatch({ type: "MINUM_SUSU" }));

  useEffect(() => () => { if (busyTimer.current) clearTimeout(busyTimer.current); }, []);


  const restart = () => {
    play("click");
    setPaused(false);
    dispatch({ type: "RESTART" });
  };
  const toMenu = () => {
    play("click");
    setPaused(false);
    setOnline(false);
    dispatch({ type: "RESET" });
  };



  // ── Online: lobby → waiting room → synced game (separate from local state) ──
  if (online) {
    const exit = () => {
      room.leave();
      setOnline(false);
    };
    return (
      <div className="min-h-full bg-bg p-5 text-cream">
        <div className="mx-auto max-w-[560px]">
          <Header muted={muted} onToggleMute={toggleMute} />
          {room.gameState ? (
            <OnlinePlay room={room} onExit={exit} />
          ) : room.code ? (
            <WaitingRoom room={room} />
          ) : (
            <OnlineLobby room={room} onBack={exit} />
          )}
        </div>
      </div>
    );
  }

  // ── 3D: full-screen "game" layout with the controls overlaid on top ──
  if (state.screen === "play") {
    return (
      <div className="fixed inset-0 z-40 bg-bg text-cream">
        <div className="absolute inset-0">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Memuat panggung 3D…
              </div>
            }
          >
            <GameScene state={state} activeIndex={activeIndex} onPick={suap} anim={anim} busy={busy} />
          </Suspense>
        </div>

        {/* top-left vertical scoreboard */}
        <div className="absolute left-4 top-4 z-50 pointer-events-none">
          <Scoreboard
            players={state.players}
            activeIndex={activeIndex}
            cycle={cycle}
            cycles={state.settings.cycles}
            isFinal={isFinal}
          />
        </div>

        {/* top-right HUD controls */}
        <div className="absolute right-4 top-4 z-50 pointer-events-auto flex items-center gap-2">
          {isHumanActiveTurn && <TurnTimer secondsLeft={secondsLeft} onPause={() => setPaused(true)} />}
          <button
            className="tp-btn rounded-full bg-bg2/90 p-2.5 text-cream border border-line/10 shadow-lg backdrop-blur-md"
            style={{ backgroundColor: "rgba(42, 27, 18, 0.85)" }}
            onClick={toggleMute}
            aria-label={muted ? "Nyalakan suara" : "Bisukan suara"}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {paused && <PauseOverlay onResume={() => setPaused(false)} onRestart={restart} onMenu={toMenu} />}

        {/* side HUD: controls live in left/right panels so the centre stays clear */}
        <Hud3D
          state={state}
          activeIndex={activeIndex}
          isFinal={isFinal}
          isLastTurn={state.turn + 1 >= totalTurns}
          onToggleBet={(player, bet) => {
            play("click");
            dispatch({ type: "TOGGLE_BET", player, bet });
          }}
          onAddSabo={(player) => {
            play("sabotage");
            dispatch({ type: "ADD_SABO", player });
          }}
          onConfirm={() => {
            play("click");
            dispatch({ type: "CONFIRM_PRETURN" });
          }}
          onUseTameng={() => {
            play("click");
            dispatch({ type: "USE_TAMENG" });
          }}
          onAcceptHeat={() => {
            play("click");
            dispatch({ type: "ACCEPT_HEAT" });
          }}
          onSuap={suap}
          onMinumSusu={minum}
          onSajikan={() => dispatch({ type: "SAJIKAN" })}
          busy={busy}
          onNext={() => {
            play("click");
            dispatch({ type: "NEXT" });
          }}
        />
      </div>
    );
  }

  // ── 2D: the regular padded, scrollable layout (aligned left to show off 3D background) ──
  return (
    <>
      <Suspense fallback={null}>
        <LobbyScene />
      </Suspense>
      <div className="min-h-full bg-transparent p-5 text-cream relative flex items-center justify-start md:pl-20">
        <div className="w-full max-w-[500px] relative z-10">
        <Header muted={muted} onToggleMute={toggleMute} />

        {state.screen === "intro" && (
          <IntroScreen
            onStart={() => {
              play("click");
              dispatch({ type: "GO_MENU" });
            }}
          />
        )}

        {state.screen === "menu" && (
          <MenuScreen
            onPickMode={(mode) => {
              play("click");
              dispatch({ type: "START_MODE", mode });
            }}
            onSettings={() => {
              play("click");
              dispatch({ type: "OPEN_SETTINGS" });
            }}
            onTutorial={() => {
              play("click");
              dispatch({ type: "OPEN_TUTORIAL" });
            }}
            onOnline={() => {
              play("click");
              setOnline(true);
            }}
          />
        )}

        {state.screen === "tutorial" && (
          <TutorialScreen
            onBack={() => {
              play("click");
              dispatch({ type: "GO_MENU" });
            }}
          />
        )}

        {state.screen === "settings" && (
          <SettingsScreen
            cycles={state.settings.cycles}
            muted={muted}
            onSetCycles={(c) => {
              play("click");
              dispatch({ type: "SET_CYCLES", cycles: c });
            }}
            onToggleMute={toggleMute}
            onBack={() => {
              play("click");
              dispatch({ type: "GO_MENU" });
            }}
          />
        )}

        {state.screen === "setup" && (
          <SetupScreen
            players={state.players}
            mode={state.mode}
            onSetCount={(c) => {
              play("click");
              dispatch({ type: "SET_COUNT", count: c });
            }}
            onRename={(i, name) => dispatch({ type: "RENAME", index: i, name })}
            onStart={() => {
              play("click");
              dispatch({ type: "START_DRAFT" });
            }}
            onBack={() => {
              play("click");
              dispatch({ type: "GO_MENU" });
            }}
          />
        )}

        {state.screen === "draft" && (
          <DraftScreen
            players={state.players}
            draftIdx={state.draftIdx}
            options={state.draftOpts}
            onChoose={(char) => {
              play("click");
              dispatch({ type: "CHOOSE_CHAR", char });
            }}
          />
        )}



        {state.screen === "shop" && (
          <ShopScreen
            players={state.players}
            cycle={cycle - 1}
            onBuy={(player, item) => {
              play("click");
              dispatch({ type: "BUY", player, item });
            }}
            onClose={() => {
              play("click");
              dispatch({ type: "CLOSE_SHOP" });
            }}
          />
        )}

        {state.screen === "gameover" && (
          <GameOverScreen
            players={state.players}
            onReset={() => {
              play("click");
              dispatch({ type: "RESET" });
            }}
          />
        )}
      </div>

      {paused && <PauseOverlay onResume={() => setPaused(false)} onRestart={restart} onMenu={toMenu} />}
    </div>
    </>
  );
}
