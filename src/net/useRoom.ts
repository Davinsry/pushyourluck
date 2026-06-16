import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, supabaseReady } from "./supabase";
import { actionAllowed, gameReducer, startStateFor } from "../game";
import type { Action, GameState } from "../game";
import type { PresencePayload, RoomMember, RoomSummary } from "./protocol";
import { EMOTES } from "../config/emotes";

export type RoomStatus = "idle" | "connecting" | "online" | "closed";


/** Read presence into a stable, seat-ordered member list. */
function readMembers(ch: RealtimeChannel): PresencePayload[] {
  const st = ch.presenceState<PresencePayload>();
  return Object.values(st)
    .map((arr) => arr[0])
    .filter(Boolean)
    .sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
      const num = parseInt(c, 10);
      return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16);
    });
  }
  // Math.random fallback for non-secure contexts lacking crypto completely
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Online rooms over Supabase Realtime. There is no game server: the room HOST
 * (earliest member) is authoritative — it runs the pure reducer with its own
 * rng and broadcasts the GameState; everyone else sends intents (Actions).
 * The optional `rooms` table powers the open-room browser.
 */
export function useRoom() {
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [seatIds, setSeatIds] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [roomSettings, setRoomSettings] = useState({ cycles: 3, turnTimerLimit: 30 });
  const [activeEmotes, setActiveEmotes] = useState<Record<number, string>>({});
  const roomSettingsRef = useRef({ cycles: 3, turnTimerLimit: 30 });

  const myId = useRef(generateUUID()).current;
  const myName = useRef("Pemain");
  const ch = useRef<RealtimeChannel | null>(null);
  const hostState = useRef<GameState | null>(null);
  const seatIdsRef = useRef<string[]>([]);
  const isHostRef = useRef(false);
  const startedRef = useRef(false);
  const codeRef = useRef<string | null>(null);

  // ── best-effort `rooms` table ops (degrade gracefully if absent) ──
  const upsertRoom = useCallback(async (count: number, isStarted: boolean) => {
    if (!supabase || !codeRef.current) return;
    try {
      await supabase
        .from("rooms")
        .upsert({ code: codeRef.current, host: myName.current, count, started: isStarted, updated_at: new Date().toISOString() });
    } catch {
      /* table may not exist yet — join-by-code still works */
    }
  }, []);
  const deleteRoom = useCallback(async () => {
    if (!supabase || !codeRef.current) return;
    try {
      await supabase.from("rooms").delete().eq("code", codeRef.current);
    } catch {
      /* ignore */
    }
  }, []);

  const broadcastSettings = useCallback((settings: { cycles: number; turnTimerLimit: number }) => {
    ch.current?.send({ type: "broadcast", event: "settings", payload: settings });
  }, []);

  const updateSettings = useCallback((cycles: number, turnTimerLimit: number) => {
    if (!isHostRef.current) return;
    const next = { cycles, turnTimerLimit };
    roomSettingsRef.current = next;
    setRoomSettings(next);
    broadcastSettings(next);
  }, [broadcastSettings]);

  const broadcastState = useCallback((state: GameState) => {
    ch.current?.send({ type: "broadcast", event: "state", payload: { state, seatIds: seatIdsRef.current } });
  }, []);

  /** Host applies an action on behalf of `fromId` (validates seat ownership). */
  const applyAsHost = useCallback(
    (fromId: string, action: Action) => {
      const s = hostState.current;
      if (!s) return;
      const seat = seatIdsRef.current.indexOf(fromId);
      if (seat < 0 || !actionAllowed(s, seat, action)) return;
      const next = gameReducer(s, action, Math.random);
      hostState.current = next;
      setGameState(next);
      broadcastState(next);
    },
    [broadcastState]
  );

  const handlePresence = useCallback(() => {
    const channel = ch.current;
    if (!channel) return;
    const ms = readMembers(channel);
    setMembers(ms.map((m) => ({ id: m.id, name: m.name, connected: true })));
    const host = ms[0]?.id ?? null;
    setHostId(host);
    isHostRef.current = host === myId;
    if (isHostRef.current && !startedRef.current) void upsertRoom(ms.length, false);
  }, [myId, upsertRoom]);

  const joinChannel = useCallback(
    (roomCode: string, asHost: boolean) => {
      if (!supabase) {
        setError("Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL & VITE_SUPABASE_KEY di .env.local.");
        return;
      }
      setStatus("connecting");
      setError(null);
      codeRef.current = roomCode;
      setCode(roomCode);

      const channel = supabase.channel(`room:${roomCode}`, {
        config: { presence: { key: myId }, broadcast: { self: false } },
      });

      channel
        .on("broadcast", { event: "state" }, ({ payload }) => {
          setGameState(payload.state as GameState);
          seatIdsRef.current = payload.seatIds as string[];
          setSeatIds(payload.seatIds as string[]);
          setStarted(true);
          startedRef.current = true;
        })
        .on("broadcast", { event: "settings" }, ({ payload }) => {
          const s = {
            cycles: payload.cycles as number,
            turnTimerLimit: payload.turnTimerLimit as number,
          };
          roomSettingsRef.current = s;
          setRoomSettings(s);
        })
        .on("broadcast", { event: "action" }, ({ payload }) => {
          if (isHostRef.current) applyAsHost(payload.fromId as string, payload.action as Action);
        })
        .on("broadcast", { event: "emote" }, ({ payload }) => {
          const seatIdx = seatIdsRef.current.indexOf(payload.senderId);
          if (seatIdx >= 0) {
            const emoteId = payload.emoteId as string;
            const emoji = EMOTES.find((e) => e.id === emoteId)?.emoji || "";
            if (emoji) {
              setActiveEmotes((prev) => ({ ...prev, [seatIdx]: emoji }));
              setTimeout(() => {
                setActiveEmotes((prev) => {
                  if (prev[seatIdx] === emoji) {
                    const next = { ...prev };
                    delete next[seatIdx];
                    return next;
                  }
                  return prev;
                });
              }, 3000);
            }
          }
        })
        .on("presence", { event: "sync" }, handlePresence)
        .on("presence", { event: "join" }, () => {
          // re-sync a late joiner / reconnect by re-sending the current state or settings
          if (isHostRef.current) {
            if (hostState.current) {
              broadcastState(hostState.current);
            } else {
              broadcastSettings(roomSettingsRef.current);
            }
          }
        })
        .subscribe(async (s) => {
          if (s === "SUBSCRIBED") {
            await channel.track({ id: myId, name: myName.current, ts: Date.now() } satisfies PresencePayload);
            setStatus("online");
            if (asHost) void upsertRoom(1, false);
          } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
            setError("Gagal nyambung ke Supabase Realtime.");
          }
        });

      ch.current = channel;
    },
    [applyAsHost, broadcastSettings, broadcastState, handlePresence, myId, upsertRoom]
  );

  const create = useCallback(
    (name: string, roomName: string) => {
      myName.current = name || "Pemain";
      joinChannel(roomName, true);
    },
    [joinChannel]
  );

  const join = useCallback(
    (joinCode: string, name: string) => {
      myName.current = name || "Pemain";
      joinChannel(joinCode.toUpperCase(), false);
    },
    [joinChannel]
  );

  const refreshRooms = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from("rooms")
        .select("code,host,count")
        .eq("started", false)
        .order("updated_at", { ascending: false })
        .limit(20);
      setRooms((data ?? []).filter((r) => r.count < 4) as RoomSummary[]);
    } catch {
      setRooms([]);
    }
  }, []);

  const start = useCallback(() => {
    if (!isHostRef.current || !ch.current) return;
    const ms = readMembers(ch.current);
    if (ms.length < 2) return;
    const ids = ms.map((m) => m.id);
    seatIdsRef.current = ids;
    setSeatIds(ids);
    const s = startStateFor(
      ms.map((m) => m.name),
      Math.random
    );
    s.settings.cycles = roomSettingsRef.current.cycles;
    s.settings.turnTimerLimit = roomSettingsRef.current.turnTimerLimit;

    hostState.current = s;
    setGameState(s);
    setStarted(true);
    startedRef.current = true;
    broadcastState(s);
    void upsertRoom(ms.length, true);
  }, [broadcastState, upsertRoom]);

  const sendAction = useCallback(
    (action: Action) => {
      if (isHostRef.current) applyAsHost(myId, action);
      else ch.current?.send({ type: "broadcast", event: "action", payload: { fromId: myId, action } });
    },
    [applyAsHost, myId]
  );

  const reset = useCallback(() => {
    if (isHostRef.current) void deleteRoom();
    if (ch.current && supabase) {
      void ch.current.untrack();
      void supabase.removeChannel(ch.current);
    }
    ch.current = null;
    hostState.current = null;
    seatIdsRef.current = [];
    isHostRef.current = false;
    startedRef.current = false;
    codeRef.current = null;
    setStatus("idle");
    setCode(null);
    setMembers([]);
    setHostId(null);
    setGameState(null);
    setSeatIds([]);
    setStarted(false);
    setError(null);
    roomSettingsRef.current = { cycles: 3, turnTimerLimit: 30 };
    setRoomSettings({ cycles: 3, turnTimerLimit: 30 });
  }, [deleteRoom]);

  // Tidy up on unmount.
  useEffect(() => () => reset(), [reset]);

  const youSeat = started ? seatIds.indexOf(myId) : members.findIndex((m) => m.id === myId);
  const isHost = !!hostId && hostId === myId;

  const sendEmote = useCallback(
    (emoteId: string) => {
      if (!ch.current) return;
      ch.current.send({
        type: "broadcast",
        event: "emote",
        payload: { senderId: myId, emoteId },
      });

      // Display locally immediately
      const seatIdx = seatIdsRef.current.indexOf(myId);
      if (seatIdx >= 0) {
        const emoji = EMOTES.find((e) => e.id === emoteId)?.emoji || "";
        if (emoji) {
          setActiveEmotes((prev) => ({ ...prev, [seatIdx]: emoji }));
          setTimeout(() => {
            setActiveEmotes((prev) => {
              if (prev[seatIdx] === emoji) {
                const next = { ...prev };
                delete next[seatIdx];
                return next;
              }
              return prev;
            });
          }, 3000);
        }
      }
    },
    [myId, seatIds]
  );

  return {
    ready: supabaseReady,
    status,
    error,
    myId,
    code,
    members,
    hostId,
    isHost,
    started,
    rooms,
    gameState,
    youSeat,
    roomSettings,
    updateSettings,
    create,
    join,
    refreshRooms,
    start,
    sendAction,
    leave: reset,
    activeEmotes,
    sendEmote,
  };
}

export type UseRoom = ReturnType<typeof useRoom>;
