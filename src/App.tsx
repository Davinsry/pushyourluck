import { Suspense, lazy, useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useGame } from "./hooks/useGame";
import { useSound } from "./hooks/useSound";
import type { BiteId } from "./game";
import {
  isFinalRonde,
  totalTurns as getGameTotalTurns,
  activeIndex as getGameActiveIndex,
  currentCycle as getGameCurrentCycle,
  analyzePlaystyle,
  calculatePlaytestingStats
} from "./game";
import { HistoryScreen } from "./components/HistoryScreen";
import { CHARS } from "./config/balance";
import { color } from "./ui/theme";
import { ACTION_ANIM_MS, TURN_SECONDS } from "./config/balance";
import { EMOTES } from "./config/emotes";
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
import { LobbyScene } from "./three/LobbyScene";
class HeartbeatSynthesizer {
  private ctx: AudioContext | null = null;
  private timerId: any = null;
  private bpm: number = 60;
  private volume: number = 0;
  private muted: boolean = false;

  constructor() {}

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopTicking();
    }
  }

  update(heat: number, isTurnActive: boolean) {
    if (this.muted || !isTurnActive || heat < 15) {
      this.stopTicking();
      return;
    }

    // BPM increases as heat increases: from 60 BPM (at heat 15) to 150 BPM (at heat 90)
    const targetBpm = Math.min(160, 60 + ((heat - 15) / 75) * 100);
    // Volume increases as heat increases: from 0 (at heat 15) to 0.8 (at heat 90)
    const targetVolume = Math.min(0.8, ((heat - 15) / 60) * 0.8);

    this.bpm = targetBpm;
    this.volume = targetVolume;

    this.startTicking();
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  private startTicking() {
    if (this.timerId !== null) return;
    this.initCtx();
    
    const tick = () => {
      if (this.muted || this.volume <= 0) {
        this.stopTicking();
        return;
      }
      this.playThump();
      
      const intervalMs = (60 / this.bpm) * 1000;
      this.timerId = setTimeout(tick, intervalMs);
    };

    tick();
  }

  private stopTicking() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private playThump() {
    if (!this.ctx || this.ctx.state === "suspended") return;

    try {
      const playSingleBeat = (timeOffset: number, freq: number, gainAmt: number) => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.ctx!.destination);

        const now = this.ctx!.currentTime + timeOffset;
        osc.frequency.setValueAtTime(freq, now);
        // Sweep frequency down slightly to simulate low thump
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.15);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gainAmt * this.volume, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.start(now);
        osc.stop(now + 0.2);
      };

      // Lub-dub: First thump (lub)
      playSingleBeat(0, 55, 0.8);
      // Second thump (dub) - slightly higher frequency, slightly quieter, ~0.15s later
      playSingleBeat(0.15, 60, 0.5);
    } catch (e) {
      console.warn("Failed to play heartbeat thump", e);
    }
  }

  destroy() {
    this.stopTicking();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export default function App() {
  const game = useGame();
  const { state, dispatch, activeIndex, cycle, isFinal, totalTurns, activePlayer } = game;
  const { play, muted, toggleMute } = useSound();
  const [online, setOnline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("push_your_luck_username") || "";
    }
    return "";
  });

  const handleSetUsername = (name: string) => {
    setUsername(name);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("push_your_luck_username", name);
    }
  };
  const room = useRoom();

  // Generate or reset local game ID
  const [gameId, setGameId] = useState<string | null>(null);
  const savedGamesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (state.screen === "play" && !gameId) {
      const randId = "TP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setGameId(randId);
    } else if (state.screen !== "play" && gameId) {
      setGameId(null);
    }
  }, [state.screen, gameId]);

  // Calculate URL path based on current state
  const getPathForState = (screen: string, isOnline: boolean, roomCode: string | null, roomHasGame: boolean, gid: string | null) => {
    if (isOnline) {
      if (roomHasGame) {
        return `/online/play?room=${roomCode || ""}`;
      }
      if (roomCode) {
        return `/room?code=${roomCode}`;
      }
      return "/online";
    }

    switch (screen) {
      case "play":
        return `/play?id=${gid || ""}`;
      case "tutorial":
        return "/rules";
      case "settings":
        return "/settings";
      case "setup":
        return "/setup";
      case "draft":
        return "/draft";
      case "shop":
        return "/shop";
      case "gameover":
        return "/gameover";
      case "history":
        return "/history";
      case "menu":
        return "/home";
      case "intro":
      default:
        return "/";
    }
  };

  const syncUrlToState = useCallback((pathname: string, search: string) => {
    const params = new URLSearchParams(search);
    const code = params.get("code") || params.get("room");
    const id = params.get("id");

    if (
      pathname.startsWith("/online/play") ||
      pathname.startsWith("/online/waiting") ||
      pathname.startsWith("/room") ||
      pathname === "/online"
    ) {
      setOnline(true);
      if (code && !room.code) {
        room.join(code, "Pemain");
      }
    } else {
      setOnline(false);
      if (pathname === "/rules") {
        if (state.screen !== "tutorial") dispatch({ type: "OPEN_TUTORIAL" });
      } else if (pathname === "/settings") {
        if (state.screen !== "settings") dispatch({ type: "OPEN_SETTINGS" });
      } else if (pathname === "/history") {
        if (state.screen !== "history") dispatch({ type: "OPEN_HISTORY" });
      } else if (pathname === "/setup") {
        if (state.screen !== "setup") dispatch({ type: "START_MODE", mode: "local" });
      } else if (pathname === "/draft") {
        if (state.screen !== "draft" && state.screen !== "setup") dispatch({ type: "START_MODE", mode: "local" });
      } else if (pathname === "/play") {
        if (state.screen !== "play") {
          if (id) setGameId(id);
          dispatch({ type: "GO_MENU" });
        }
      } else if (pathname === "/shop") {
        // Shop screen is driven by game state — don't interfere
        if (state.screen !== "shop" && state.screen !== "play") dispatch({ type: "GO_MENU" });
      } else if (pathname === "/gameover") {
        // Gameover screen is driven by game state — don't interfere
        if (state.screen !== "gameover" && state.screen !== "play") dispatch({ type: "GO_MENU" });
      } else if (pathname === "/home") {
        if (state.screen !== "menu") dispatch({ type: "GO_MENU" });
      } else if (pathname === "/") {
        if (state.screen !== "intro" && state.screen !== "menu") dispatch({ type: "RESET" });
      } else {
        if (state.screen !== "intro" && state.screen !== "menu") dispatch({ type: "RESET" });
      }
    }
  }, [state.screen, room.code, dispatch]);

  // Sync state to URL
  useEffect(() => {
    if (!isInitialized) return;
    const targetPath = getPathForState(state.screen, online, room.code, !!room.gameState, gameId);
    const currentPath = window.location.pathname + window.location.search;
    if (targetPath !== currentPath) {
      window.history.pushState({ screen: state.screen, online, roomCode: room.code, roomHasGame: !!room.gameState, gameId }, "", targetPath);
    }
  }, [isInitialized, state.screen, online, room.code, room.gameState, gameId]);

  // Initial URL parsing
  useEffect(() => {
    syncUrlToState(window.location.pathname, window.location.search);
    setIsInitialized(true);
  }, [syncUrlToState]);

  // Popstate listener for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      syncUrlToState(window.location.pathname, window.location.search);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [syncUrlToState]);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const inGameMusicRef = useRef<HTMLAudioElement | null>(null);
  const heartbeatRef = useRef<HeartbeatSynthesizer | null>(null);

  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio("/lobby-music.mp3");
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.35;
    }
    if (!inGameMusicRef.current) {
      inGameMusicRef.current = new Audio("/videoplayback.weba");
      inGameMusicRef.current.loop = true;
      inGameMusicRef.current.volume = 0.15; // lower volume as requested
    }
    if (!heartbeatRef.current) {
      heartbeatRef.current = new HeartbeatSynthesizer();
    }

    return () => {
      if (bgMusicRef.current) bgMusicRef.current.pause();
      if (inGameMusicRef.current) inGameMusicRef.current.pause();
      if (heartbeatRef.current) {
        heartbeatRef.current.destroy();
        heartbeatRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const lobbyMusic = bgMusicRef.current;
    const playMusic = inGameMusicRef.current;
    if (!lobbyMusic || !playMusic) return;

    const isLobby = state.screen !== "play" && state.screen !== "shop" && state.screen !== "draft" && !room.gameState;

    const playOnInteraction = () => {
      if (!muted) {
        const currentLobby = state.screen !== "play" && state.screen !== "shop" && state.screen !== "draft" && !room.gameState;
        if (currentLobby) {
          lobbyMusic.play().catch(() => {});
          playMusic.pause();
        } else {
          playMusic.play().catch(() => {});
          lobbyMusic.pause();
        }
      }
    };

    if (!muted) {
      if (isLobby) {
        playMusic.pause();
        lobbyMusic.play().catch(() => {
          window.addEventListener("click", playOnInteraction, { once: true });
          window.addEventListener("touchstart", playOnInteraction, { once: true });
        });
      } else {
        lobbyMusic.pause();
        playMusic.play().catch(() => {
          window.addEventListener("click", playOnInteraction, { once: true });
          window.addEventListener("touchstart", playOnInteraction, { once: true });
        });
      }
    } else {
      lobbyMusic.pause();
      playMusic.pause();
    }

    return () => {
      lobbyMusic.pause();
      playMusic.pause();
      window.removeEventListener("click", playOnInteraction);
      window.removeEventListener("touchstart", playOnInteraction);
    };
  }, [state.screen, room.gameState?.screen, muted]);

  // Update heartbeat synthesizer based on current heat & phase
  useEffect(() => {
    if (!heartbeatRef.current) return;
    heartbeatRef.current.setMuted(muted);

    const isPlayActive =
      (state.screen === "play" && state.phase === "active") ||
      !!(online && room.gameState && room.gameState.screen === "play" && room.gameState.phase === "active");

    const currentHeat = online && room.gameState ? room.gameState.heat : state.heat;

    heartbeatRef.current.update(currentHeat, isPlayActive);
  }, [state.screen, state.phase, state.heat, online, room.gameState?.screen, room.gameState?.phase, room.gameState?.heat, muted]);

  // While an eat/drink animation plays, lock the controls so the player has to
  // wait for the hand to finish before acting again. `anim` drives the 3D hand.
  const [busy, setBusy] = useState(false);
  const [anim, setAnim] = useState<ActionAnim | null>(null);
  const busyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pause + per-turn countdown (local/solo only; online is host-driven).
  const [paused, setPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TURN_SECONDS);

  let currentLimit = TURN_SECONDS;
  let timerType: "active" | "preturn" | "shop" | null = null;

  if (state.screen === "play") {
    if (state.phase === "active" && !activePlayer?.isBot) {
      currentLimit = TURN_SECONDS;
      timerType = "active";
    } else if (state.phase === "preturn" && !state.blockAsk) {
      currentLimit = 30;
      timerType = "preturn";
    }
  } else if (state.screen === "shop") {
    currentLimit = 60;
    timerType = "shop";
  }

  // Restart the countdown whenever the timer type or turn/phase changes.
  useEffect(() => {
    if (timerType) {
      setSecondsLeft(currentLimit);
    }
  }, [state.turn, state.phase, state.screen, state.blockAsk, timerType, currentLimit]);

  // Tick the countdown; running out dispatches the corresponding skip/confirm/close action.
  useEffect(() => {
    if (!timerType || paused) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerType === "active") {
            dispatch({ type: "SKIP_TURN" });
          } else if (timerType === "preturn") {
            dispatch({ type: "CONFIRM_PRETURN" });
          } else if (timerType === "shop") {
            dispatch({ type: "CLOSE_SHOP" });
          }
          return currentLimit;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerType, paused, dispatch, currentLimit]);

  // Online timer countdown.
  const onlineLimit = room.gameState?.settings.turnTimerLimit ?? 0;
  const [onlineSecondsLeft, setOnlineSecondsLeft] = useState(onlineLimit);

  useEffect(() => {
    if (!online || !room.gameState) return;
    const scr = room.gameState.screen;
    const p = room.gameState.phase;
    const blockAsk = room.gameState.blockAsk;
    
    if (scr === "shop") {
      setOnlineSecondsLeft(20);
    } else if (p === "active" && onlineLimit > 0) {
      setOnlineSecondsLeft(onlineLimit);
    } else if (p === "preturn" && !blockAsk) {
      setOnlineSecondsLeft(30);
    }
  }, [online, room.gameState?.turn, room.gameState?.phase, room.gameState?.screen, room.gameState?.blockAsk, onlineLimit]);

  useEffect(() => {
    if (!online || !room.gameState) return;
    const scr = room.gameState.screen;
    const p = room.gameState.phase;
    const blockAsk = room.gameState.blockAsk;
    const ai = getGameActiveIndex(room.gameState);
    
    if (scr !== "shop" && p !== "active" && (p !== "preturn" || blockAsk)) return;
    if (p === "active" && onlineLimit <= 0) return;

    const phaseLimit = scr === "shop" ? 20 : (p === "active" ? onlineLimit : 30);

    const id = setInterval(() => {
      setOnlineSecondsLeft((s) => {
        if (s <= 1) {
          if (scr === "shop") {
            if (room.isHost) {
              room.sendAction({ type: "CLOSE_SHOP" });
            }
            if (room.isHost) {
              if (s === 1) return 0;
            } else {
              return 20;
            }
          } else if (p === "active") {
            if (room.youSeat === ai) {
              room.sendAction({ type: "SKIP_TURN" });
            }
            if (room.isHost && room.youSeat !== ai) {
              if (s === 1) return 0;
            } else {
              return onlineLimit;
            }
          } else if (p === "preturn") {
            if (room.youSeat === ai) {
              room.sendAction({ type: "CONFIRM_PRETURN" });
            }
            if (room.isHost && room.youSeat !== ai) {
              if (s === 1) return 0;
            } else {
              return 30;
            }
          }
        }

        if (s <= 0) {
          if (room.isHost) {
            if (s <= -3) {
              if (scr === "shop") {
                room.sendAction({ type: "CLOSE_SHOP" });
                return 20;
              } else if (p === "active" && room.youSeat !== ai) {
                room.sendAction({ type: "SKIP_TURN" });
                return onlineLimit;
              } else if (p === "preturn" && room.youSeat !== ai) {
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
  }, [online, room.gameState?.screen, room.gameState?.phase, room.gameState?.blockAsk, room.youSeat, room.gameState ? getGameActiveIndex(room.gameState) : -1, onlineLimit, room.isHost]);

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

  // Save game to localStorage history on game over (local/solo only)
  useEffect(() => {
    if (state.screen === "gameover" && gameId) {
      if (savedGamesRef.current.has(gameId)) return;
      savedGamesRef.current.add(gameId);

      try {
        const saved = localStorage.getItem("tahan_pedas_history");
        const list = saved ? JSON.parse(saved) : [];

        const pStats = calculatePlaytestingStats(state.players);

        const playersInfo = state.players.map((p) => {
          const charDef = p.char ? CHARS[p.char] : null;
          const charName = charDef ? charDef.name : "-";
          const charColor = charDef ? color(charDef.colorKey) : "var(--c-muted)";
          const pStatsObj = p.stats ?? { ijoCount: 0, rawitCount: 0, carolinaCount: 0, maxHeat: 0, correctBets: 0, busts: 0 };
          const playstyle = analyzePlaystyle(pStatsObj);

          return {
             name: p.name,
             score: p.score,
             charName,
             charColor,
             stats: pStatsObj,
             playstyle,
          };
        });

        const record = {
          id: gameId,
          timestamp: Date.now(),
          mode: state.mode,
          cycles: state.settings.cycles,
          players: playersInfo,
          playtestingStats: {
            favoriteChili: pStats.favoriteChili,
            spiciestKing: pStats.spiciestKing,
            bestGuesser: pStats.bestGuesser,
            mostBusted: pStats.mostBusted,
          },
        };

        list.push(record);
        localStorage.setItem("tahan_pedas_history", JSON.stringify(list));
      } catch (e) {
        console.error("Gagal menyimpan riwayat permainan:", e);
      }
    }
  }, [state.screen, gameId, state.players, state.mode, state.settings.cycles]);

  // (Bot/solo mode removed — this is offline pass-and-play only.)

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

  // Calculate current heat, shake, and vignette opacity
  const onlinePlayActive = online && room.gameState && room.gameState.screen === "play";
  const offlinePlayActive = !online && state.screen === "play";
  const isPlayActive = onlinePlayActive || offlinePlayActive;

  const currentHeat = isPlayActive 
    ? (online && room.gameState ? room.gameState.heat : state.heat) 
    : 0;

  const shakeAmount = currentHeat > 15 ? Math.min(8, (currentHeat - 15) / 8) : 0;
  const redOpacity = currentHeat > 10 ? Math.min(0.8, (currentHeat - 10) / 80) : 0;

  // ── Online: lobby → waiting room → synced game (separate from local state) ──
  if (online) {
    const exit = () => {
      room.leave();
      setOnline(false);
    };

    if (room.gameState && (room.gameState.screen === "play" || room.gameState.screen === "shop")) {
      const activeIdx = getGameActiveIndex(room.gameState);
      const isFinalRondeActive = isFinalRonde(room.gameState);
      const totalTurnsCount = getGameTotalTurns(room.gameState);
      const activePlayerObj = room.gameState.players[activeIdx];
      const isHumanActiveTurn = activePlayerObj && !activePlayerObj.isBot && room.youSeat === activeIdx;

      return (
        <div className={`fixed inset-0 z-40 bg-bg text-cream ${paused ? "game-paused" : ""}`}>
          {/* Red Vignette Overlay for Heat/Spiciness */}
          <div 
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
            style={{
              opacity: redOpacity,
              background: "radial-gradient(circle, transparent 20%, rgba(215, 38, 61, 0.6) 100%)",
            }}
          />
          <div 
            className={`absolute inset-0 ${shakeAmount > 0 ? "animate-shake" : ""}`}
            style={{
              "--shake-amt": shakeAmount
            } as React.CSSProperties}
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  Memuat panggung 3D…
                </div>
              }
            >
              <GameScene
                state={room.gameState}
                activeIndex={activeIdx}
                onPick={(bite) => {
                  if (isHumanActiveTurn) {
                    animateThen("bite", bite, () => room.sendAction({ type: "SUAP", bite }));
                  }
                }}
                anim={anim}
                busy={busy}
                paused={paused}
              />
            </Suspense>
          </div>

          {/* Emote Panel (Middle Right) */}
          {room.gameState.screen === "play" && (
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
          )}

          {/* top-left vertical scoreboard & ID badge */}
          {room.gameState.screen === "play" && (
            <div className="absolute left-4 top-4 z-50 pointer-events-none flex flex-col gap-2">
              <Scoreboard
                players={room.gameState.players}
                activeIndex={activeIdx}
                cycle={getGameCurrentCycle(room.gameState)}
                cycles={room.gameState.settings.cycles}
                isFinal={isFinalRondeActive}
                activeEmotes={room.activeEmotes}
                className="w-[140px]"
              />
              <div
                className="rounded-2xl px-3 py-1.5 text-center border border-line/10 shadow-lg backdrop-blur-md pointer-events-auto w-[140px]"
                style={{
                  backgroundColor: "rgba(30, 19, 13, 0.85)",
                  color: "var(--c-cream)",
                }}
              >
                <div className="text-[9px] uppercase tracking-wider text-muted font-bold">
                  ID Room
                </div>
                <div className="text-xs font-extrabold leading-none mt-0.5 text-amber">
                  {room.code}
                </div>
              </div>
            </div>
          )}

          {/* top-right HUD controls */}
          <div className="absolute right-4 top-4 z-50 pointer-events-auto flex items-center gap-2">
            {((room.gameState.settings.turnTimerLimit && room.gameState.settings.turnTimerLimit > 0 && room.gameState.phase === "active") ||
              (room.gameState.phase === "preturn" && !room.gameState.blockAsk) ||
              room.gameState.screen === "shop") && (
              <TurnTimer secondsLeft={onlineSecondsLeft} onPause={undefined} />
            )}
            <button
              className="tp-btn rounded-full bg-bg2/90 p-2.5 text-cream border border-line/10 shadow-lg backdrop-blur-md"
              style={{ backgroundColor: "rgba(42, 27, 18, 0.85)" }}
              onClick={toggleMute}
              aria-label={muted ? "Nyalakan suara" : "Bisukan suara"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* side HUD: controls live in left/right panels so the centre stays clear */}
          {room.gameState.screen === "play" ? (
            <Hud3D
              state={room.gameState}
              activeIndex={activeIdx}
              isFinal={isFinalRondeActive}
              isLastTurn={room.gameState.turn + 1 >= totalTurnsCount}
              onToggleBet={(player, bet) => {
                play("click");
                room.sendAction({ type: "TOGGLE_BET", player, bet });
              }}
              onAddSabo={(player) => {
                play("sabotage");
                room.sendAction({ type: "ADD_SABO", player });
              }}
              onTogglePassiveShield={() => {
                play("click");
                room.sendAction({ type: "TOGGLE_PASSIVE_SHIELD" });
              }}
              onConfirm={() => {
                play("click");
                room.sendAction({ type: "CONFIRM_PRETURN" });
              }}
              onUseTameng={(count) => {
                play("click");
                room.sendAction({ type: "USE_TAMENG", count });
              }}
              onAcceptHeat={() => {
                play("click");
                room.sendAction({ type: "ACCEPT_HEAT" });
              }}
              onSuap={(bite) => {
                if (isHumanActiveTurn) {
                  animateThen("bite", bite, () => room.sendAction({ type: "SUAP", bite }));
                }
              }}
              onMinumSusu={() => {
                if (isHumanActiveTurn) {
                  animateThen("milk", undefined, () => room.sendAction({ type: "MINUM_SUSU" }));
                }
              }}
              onSajikan={() => room.sendAction({ type: "SAJIKAN" })}
              busy={busy || !isHumanActiveTurn}
              onNext={() => {
                play("click");
                room.sendAction({ type: "NEXT" });
              }}
            />
          ) : (
            <div className="min-h-full bg-transparent p-5 text-cream relative flex items-center justify-start md:pl-20 z-40">
              <div className="w-full max-w-[500px] relative z-10 pointer-events-auto">
                <ShopScreen
                  players={room.gameState.players}
                  cycle={getGameCurrentCycle(room.gameState) - 1}
                  secondsLeft={onlineSecondsLeft}
                  onBuy={(_, item) => {
                    if (room.youSeat !== null) {
                      play("click");
                      room.sendAction({ type: "BUY", player: room.youSeat, item });
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <LobbyScene />
        <div className="min-h-full bg-transparent p-5 text-cream relative flex items-center justify-start md:pl-20">
          <div className="w-full max-w-[500px] relative z-10">
            <Header />
            {room.gameState ? (
              <OnlinePlay room={room} onExit={exit} />
            ) : room.code ? (
              <WaitingRoom room={room} />
            ) : (
              <OnlineLobby room={room} onBack={exit} />
            )}
          </div>
        </div>
      </>
    );
  }

  // ── 3D: full-screen "game" layout with the controls overlaid on top ──
  if (state.screen === "play" || state.screen === "shop") {
    return (
      <div className={`fixed inset-0 z-40 bg-bg text-cream ${paused ? "game-paused" : ""}`}>
        {/* Red Vignette Overlay for Heat/Spiciness */}
        <div 
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: redOpacity,
            background: "radial-gradient(circle, transparent 20%, rgba(215, 38, 61, 0.6) 100%)",
          }}
        />
        <div 
          className={`absolute inset-0 ${shakeAmount > 0 ? "animate-shake" : ""}`}
          style={{
            "--shake-amt": shakeAmount
          } as React.CSSProperties}
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Memuat panggung 3D…
              </div>
            }
          >
            <GameScene state={state} activeIndex={activeIndex} onPick={suap} anim={anim} busy={busy} paused={paused} />
          </Suspense>
        </div>

        {/* top-left vertical scoreboard & ID badge */}
        {state.screen === "play" && (
          <div className="absolute left-4 top-4 z-50 pointer-events-none flex flex-col gap-2">
            <Scoreboard
              players={state.players}
              activeIndex={activeIndex}
              cycle={cycle}
              cycles={state.settings.cycles}
              isFinal={isFinal}
              className="w-[140px]"
            />
          </div>
        )}

        {/* top-right HUD controls */}
        <div className="absolute right-4 top-4 z-50 pointer-events-auto flex items-center gap-2">
          {(timerType === "preturn" || timerType === "active" || timerType === "shop") && (
            <TurnTimer secondsLeft={secondsLeft} onPause={state.screen === "play" ? () => setPaused(true) : undefined} />
          )}
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
        {state.screen === "play" ? (
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
            onTogglePassiveShield={() => {
              play("click");
              dispatch({ type: "TOGGLE_PASSIVE_SHIELD" });
            }}
            onConfirm={() => {
              play("click");
              dispatch({ type: "CONFIRM_PRETURN" });
            }}
            onUseTameng={(count) => {
              play("click");
              dispatch({ type: "USE_TAMENG", count });
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
        ) : (
          <div className="min-h-full bg-transparent p-5 text-cream relative flex items-center justify-start md:pl-20 z-40">
            <div className="w-full max-w-[500px] relative z-10 pointer-events-auto">
              <ShopScreen
                players={state.players}
                cycle={cycle - 1}
                secondsLeft={secondsLeft}
                onBuy={(player, item) => {
                  play("click");
                  dispatch({ type: "BUY", player, item });
                }}
                onClose={() => {
                  play("click");
                  dispatch({ type: "CLOSE_SHOP" });
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 2D: the regular padded, scrollable layout (aligned left to show off 3D background) ──
  return (
    <>
      <LobbyScene />
      <div className="min-h-full bg-transparent p-5 text-cream relative flex items-center justify-start md:pl-20">
        <div className="w-full max-w-[500px] relative z-10">
        <Header />

        {state.screen === "intro" && (
          <IntroScreen
            initialName={username}
            onStart={(name) => {
              handleSetUsername(name);
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
            onHistory={() => {
              play("click");
              dispatch({ type: "OPEN_HISTORY" });
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
            username={username}
            onSetUsername={handleSetUsername}
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

        {state.screen === "gameover" && (
          <GameOverScreen
            players={state.players}
            onReset={() => {
              play("click");
              dispatch({ type: "RESET" });
            }}
          />
        )}

        {state.screen === "history" && (
          <HistoryScreen
            onBack={() => {
              play("click");
              dispatch({ type: "GO_MENU" });
            }}
          />
        )}
      </div>

      {paused && <PauseOverlay onResume={() => setPaused(false)} onRestart={restart} onMenu={toMenu} />}
    </div>
    </>
  );
}
