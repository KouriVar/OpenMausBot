import { useSyncExternalStore } from "react";

import type { MausColor } from "@/lib/mascot";
import { EXPRESSION_BY_ID } from "@/vendor/bloub/expressions";
import { COLOR_BY_ID, COLORS, SHAPE_BY_ID, type ColorId, type ShapeId } from "@/vendor/bloub/skins";
import { DEFAULT_EXPRESSION } from "@/vendor/bloub/expressions";

/** One bot's Bloub look, kept per bot id. */
export interface BloubSkin {
  shape: ShapeId;
  color: ColorId;
  expression: string;
}

export const BLOUB_SKIN_PREFIX = "omb.fork.bloub.";

/** A bot's OMB colour on Bloub's own palette. */
const COLOR_BY_MAUS: Partial<Record<MausColor, ColorId>> = {
  green: "vert",
  teal: "turquoise",
  cyan: "turquoise",
  blue: "bleu",
  purple: "violet",
  pink: "rose",
  coral: "rose",
  red: "rouge",
  orange: "orange",
  yellow: "ambre",
  silver: "gris",
  chrome: "gris",
};

export const BLOUB_DEFAULT_SHAPE: ShapeId = "cercle";
export const BLOUB_DEFAULT_EXPRESSION = DEFAULT_EXPRESSION;

export function defaultBloubSkin(color: MausColor | string | undefined): BloubSkin {
  return { shape: BLOUB_DEFAULT_SHAPE, color: COLOR_BY_MAUS[color as MausColor] ?? "encre", expression: BLOUB_DEFAULT_EXPRESSION };
}

/** A stored value read back: every field checked, each bad one falling back on its own. */
export function parseBloubSkin(raw: string | null | undefined, fallback: BloubSkin): BloubSkin {
  if (!raw) return fallback;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  return {
    shape: typeof record.shape === "string" && SHAPE_BY_ID.has(record.shape) ? (record.shape as ShapeId) : fallback.shape,
    color: typeof record.color === "string" && COLOR_BY_ID.has(record.color) ? (record.color as ColorId) : fallback.color,
    expression: typeof record.expression === "string" && EXPRESSION_BY_ID.has(record.expression) ? record.expression : fallback.expression,
  };
}

/* ------------------------------------------------------------- the store */

const cache = new Map<string, string>();
const listeners = new Set<() => void>();

function read(botId: string): string | null {
  if (cache.has(botId)) return cache.get(botId)!;
  try {
    const value = globalThis.localStorage?.getItem(BLOUB_SKIN_PREFIX + botId) ?? null;
    if (value !== null) cache.set(botId, value);
    return value;
  } catch {
    return null;
  }
}

export function loadBloubSkin(botId: string | undefined, color: MausColor | string | undefined): BloubSkin {
  const fallback = defaultBloubSkin(color);
  if (!botId) return fallback;
  return parseBloubSkin(read(botId), fallback);
}

export function saveBloubSkin(botId: string, skin: BloubSkin): void {
  const value = JSON.stringify(skin);
  cache.set(botId, value);
  try {
    globalThis.localStorage?.setItem(BLOUB_SKIN_PREFIX + botId, value);
  } catch {
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A bot's look, re-read whenever any bot's is saved. */
export function useBloubSkin(botId: string | undefined, color: MausColor | string | undefined): BloubSkin {
  const raw = useSyncExternalStore(
    subscribe,
    () => (botId ? read(botId) ?? "" : ""),
    () => "",
  );
  return parseBloubSkin(raw || null, defaultBloubSkin(color));
}

/* ------------------------------------------------------------- the palette */

/** Grok's sidebar palette, sampled from its dark screenshot. Ids are Bloub's, values Grok's. */
export const FORK_BLOUB_PALETTE: "grok" | "bloub" = "grok";

const GROK_HEX: Record<string, string> = {
  creme: "#ffffff",
  brun: "#a16c39",
  rouge: "#f62c3e",
  orange: "#f7670d",
  ambre: "#f79410",
  vert: "#38c470",
  turquoise: "#36b8a2",
  bleu: "#2c84fc",
  violet: "#9159fb",
  rose: "#f73399",
  // Black has no place in Grok's palette: both a stored encre and creme read as white.
  encre: "#ffffff",
  gris: "#777777",
};

/** Grok's eyes are near-black on every body; Bloub's own palette keeps its paper holes. */
export const GROK_EYE_COLOR = "#0b0b0c";
/** The resting 2.5D look: a clear 3/4 turn, eyes in the upper-right of the body, a little above the
 * centre line and well out toward the right edge (≈44% of the radius from centre at 24°/13°). Kept as
 * its own constant, NOT limited by the pointer-follow range. */
export const GROK_DEFAULT_YAW = 27;
export const GROK_DEFAULT_PITCH = 19;

/** Each shape rests at a tilt, so the body reads as a head turned 3/4 (Grok's screenshots) rather than
 * an upright icon. Degrees; the hover lean (±6°) adds on top. Symmetric blobs stay at 0. */
export const GROK_SHAPE_ROTATION: Record<string, number> = {
  cercle: 0,
  galet: -7,
  squircle: 0,
  capsule: -8,
  triangle: 12,
  hexagone: -17,
  nuage: -10,
  goutte: -8,
  etoile4: 0,
  fleur: 0,
  coeur: 0,
  nuageFest: -8,
  etoile5: 0,
};

/** A shape's resting tilt in degrees (0 for anything unknown). */
export function bloubShapeRotation(id: string): number {
  return GROK_SHAPE_ROTATION[id] ?? 0;
}

export function bloubEyeColor(palette: "grok" | "bloub" = FORK_BLOUB_PALETTE): string | null {
  return palette === "grok" ? GROK_EYE_COLOR : null;
}

/** The 11 swatches the panel shows, Grok's order; `creme` is white, `gris` the grey. */
export const GROK_COLOR_CHOICES: ReadonlyArray<{ id: string; hex: string }> = [
  { id: "creme", hex: "#ffffff" },
  { id: "brun", hex: "#a16c39" },
  { id: "rouge", hex: "#f62c3e" },
  { id: "orange", hex: "#f7670d" },
  { id: "ambre", hex: "#f79410" },
  { id: "vert", hex: "#38c470" },
  { id: "turquoise", hex: "#36b8a2" },
  { id: "bleu", hex: "#2c84fc" },
  { id: "violet", hex: "#9159fb" },
  { id: "rose", hex: "#f73399" },
  { id: "gris", hex: "#777777" },
];

/** A colour id's hex under the chosen palette; Bloub's own table stays in `src/vendor/bloub`. */
export function bloubColorHex(id: string, palette: "grok" | "bloub" = FORK_BLOUB_PALETTE): string {
  if (palette === "grok") return GROK_HEX[id] ?? COLOR_BY_ID.get(id)?.hex ?? "#0a0a0c";
  return COLOR_BY_ID.get(id)?.hex ?? "#0a0a0c";
}

/** The swatches for the panel: 11 in Grok's palette, or Bloub's 12 when switched back. */
export function bloubColorChoices(palette: "grok" | "bloub" = FORK_BLOUB_PALETTE): ReadonlyArray<{ id: string; hex: string }> {
  if (palette === "grok") return GROK_COLOR_CHOICES;
  return COLORS.map((colour) => ({ id: colour.id, hex: colour.hex }));
}

/** The fork hides the expression grid in the avatar panel; expressions stay in code, idle uses neutre. */
export const FORK_HIDE_EXPRESSIONS_IN_PANEL = true;
