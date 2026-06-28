// ─────────────────────────────────────────────────────────────
//  Geometry helpers for seating players around the round table.
//  Pure maths (no three.js) so it stays easy to reason about.
// ─────────────────────────────────────────────────────────────

// ── Lesehan layout: players sit cross-legged on the floor around a low table. ──
export const TABLE_RADIUS = 1.7; // small low "meja lesehan"
export const TABLE_TOP_Y = 0.45; // low table surface height
export const SEAT_RADIUS = 2.7; // players sit close, on the floor mats
export const HEAD_Y = 0.95; // head height when seated cross-legged

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Angle (radians) of seat `index` for an `n`-player table. Player 0 sits at front (+z). */
export function seatAngle(index: number, n: number): number {
  // start at +z (toward the default camera) and go around the circle
  return Math.PI / 2 + (2 * Math.PI * index) / n;
}

/** Unit vector (xz-plane) pointing from the centre toward a seat. */
function seatDir(angle: number): { x: number; z: number } {
  return { x: Math.cos(angle), z: Math.sin(angle) };
}

/** World position of a seat's head. */
export function seatPosition(index: number, n: number, y = HEAD_Y): Vec3 {
  const d = seatDir(seatAngle(index, n));
  return { x: d.x * SEAT_RADIUS, y, z: d.z * SEAT_RADIUS };
}

/** Y-rotation so a model's face (local +z) looks toward the table centre. */
export function seatFacing(index: number, n: number): number {
  const a = seatAngle(index, n);
  // face should point along -seatDir (toward origin); align local +z with it
  return Math.atan2(-Math.cos(a), -Math.sin(a));
}

/**
 * Camera placement to look across the table at the active player's face.
 * Returns the camera position and the point it should look at.
 */
export function cameraForSeat(index: number, n: number): { pos: Vec3; target: Vec3 } {
  const a = seatAngle(index, n);
  const d = seatDir(a);
  const camDist = SEAT_RADIUS + 3.9; // beyond the centre → opposite side (slightly back to reveal the village)
  return {
    pos: { x: -d.x * (camDist - SEAT_RADIUS), y: TABLE_TOP_Y + 2.35, z: -d.z * (camDist - SEAT_RADIUS) },
    target: { x: d.x * SEAT_RADIUS, y: HEAD_Y - 0.05, z: d.z * SEAT_RADIUS },
  };
}

/** Positions for the 3 chili bowls in front of the active player (toward centre). */
export function bowlPositions(index: number, n: number): Vec3[] {
  const a = seatAngle(index, n);
  const d = seatDir(a);
  const perp = { x: -d.z, z: d.x }; // perpendicular, along the table edge
  const base = { x: d.x * (SEAT_RADIUS - 1.5), z: d.z * (SEAT_RADIUS - 1.5) };
  return [-0.4, 0, 0.4].map((o) => ({
    x: base.x + perp.x * o,
    y: TABLE_TOP_Y + 0.13,
    z: base.z + perp.z * o,
  }));
}

/** Position of the milk bottle on the table, to the side of the active player's bowls. */
export function milkPosition(index: number, n: number): Vec3 {
  const a = seatAngle(index, n);
  const d = seatDir(a);
  const perp = { x: -d.z, z: d.x };
  const reach = SEAT_RADIUS - 1.5;
  return {
    x: d.x * reach + perp.x * 0.95,
    y: TABLE_TOP_Y + 0.1,
    z: d.z * reach + perp.z * 0.95,
  };
}

/** Y-rotation so a prop on the table faces the camera/​active player. */
export function propFacing(index: number, n: number): number {
  return seatFacing(index, n);
}
