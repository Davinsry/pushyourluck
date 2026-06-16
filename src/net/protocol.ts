// ─────────────────────────────────────────────────────────────
//  Shapes shared across the online layer. Transport is Supabase
//  Realtime (broadcast + presence); the room HOST is authoritative
//  and runs the same pure reducer the rest of the app uses.
// ─────────────────────────────────────────────────────────────
import type { Action, GameState } from "../game/types";

export interface RoomMember {
  id: string;
  name: string;
  connected: boolean;
}

export interface RoomSummary {
  code: string;
  count: number;
  host: string;
}

/** What we track in presence for each connected client. */
export interface PresencePayload {
  id: string;
  name: string;
  ts: number; // join time → stable seat ordering
}

/** Broadcast events on a room channel. */
export type Broadcast =
  | { event: "action"; payload: { fromId: string; action: Action } } // intent → host
  | { event: "state"; payload: { state: GameState; seatIds: string[] } }; // host → everyone
