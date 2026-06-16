import { MULT } from "../config/balance";

/** Resolve a palette token (see src/index.css) to a usable CSS color value. */
export const color = (key: string) => `var(--c-${key})`;

/**
 * Distinct per-player colours (by seat index). Used for the 3D body so two
 * players who drafted the SAME character are still easy to tell apart.
 * Chosen to be distinct from each other and from the chili/character colours.
 */
export const PLAYER_COLORS = ["#e8533a", "#3e7cb1", "#8e5bd0", "#2fa98c"] as const;
export const playerColor = (index: number) => PLAYER_COLORS[index % PLAYER_COLORS.length];

/** Heat-reactive colour for the meter / numbers, mirroring the prototype. */
export function heatColor(heat: number): string {
  if (heat < MULT.t15 - 10) return color("amber");
  if (heat < MULT.t2 - 10) return color("flame");
  return color("chili");
}
