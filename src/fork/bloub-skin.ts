import { useSyncExternalStore } from "react";

import { isBloubShape } from "@/fork/bloub-shapes";
import type { MausColor } from "@/lib/mascot";
import { DEFAULT_EXPRESSION, EXPRESSION_BY_ID } from "@/vendor/bloub/expressions";
import { COLOR_BY_ID, COLORS, mixHex } from "@/vendor/bloub/skins";

/** One bot's Bloub look, kept per bot id. */
export interface BloubSkin {
  shape: string;
  color: string;
  expression: string;
}

export const BLOUB_SKIN_PREFIX = "omb.fork.bloub.";

/** A bot's OMB colour on the new Grok palette. */
const COLOR_BY_MAUS: Partial<Record<MausColor, string>> = {
  green: "green",
  teal: "cyan",
  cyan: "cyan",
  blue: "blue",
  purple: "violet",
  pink: "magenta",
  coral: "magenta",
  red: "red",
  orange: "orange",
  yellow: "yellow",
  silver: "gray",
  chrome: "gray",
};

export const BLOUB_DEFAULT_SHAPE = "blob";
export const BLOUB_DEFAULT_EXPRESSION = DEFAULT_EXPRESSION;

export function defaultBloubSkin(color: MausColor | string | undefined): BloubSkin {
  return {
    shape: BLOUB_DEFAULT_SHAPE,
    color: COLOR_BY_MAUS[color as MausColor] ?? "black",
    expression: BLOUB_DEFAULT_EXPRESSION,
  };
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
    shape: typeof record.shape === "string" && isBloubShape(record.shape) ? record.shape : fallback.shape,
    color: typeof record.color === "string" && isRecognizedBloubColor(record.color) ? normalizeBloubColor(record.color) : fallback.color,
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

/** Grok's measured palette, with pure solids plus a light and a dark gradient (from → to, 135°). */
export const FORK_BLOUB_PALETTE: BloubPalette = "grok";

export type BloubPalette = "grok" | "bloub";

export interface BloubColorDef {
  id: string;
  solid: string;
  light: [string, string];
  dark: [string, string];
}

/** The 11 measured Grok colours, in the panel's order (black … gray). */
export const GROK_COLORS: readonly BloubColorDef[] = [
  { id: "black", solid: "#000000", light: ["#585858", "#000000"], dark: ["#FFFFFF", "#C2C2C2"] },
  { id: "brown", solid: "#936439", light: ["#AE8968", "#855C36"], dark: ["#A27952", "#604227"] },
  { id: "red", solid: "#FF263C", light: ["#FF5667", "#E02135"], dark: ["#FF3E51", "#A21826"] },
  { id: "orange", solid: "#FF6700", light: ["#FF8838", "#E05B00"], dark: ["#FF781C", "#C24E00"] },
  { id: "yellow", solid: "#FF9800", light: ["#FFAF38", "#E08600"], dark: ["#FFA31C", "#C27400"] },
  { id: "green", solid: "#00C972", light: ["#1CCF82", "#009957"], dark: ["#00C972", "#008048"] },
  { id: "cyan", solid: "#00BCA6", light: ["#58D3C5", "#00A592"], dark: ["#1CC3B0", "#007769"] },
  { id: "blue", solid: "#1084FE", light: ["#459FFE", "#0E74E0"], dark: ["#2A92FE", "#0C64C1"] },
  { id: "violet", solid: "#9159FE", light: ["#B792FE", "#804EE0"], dark: ["#9159FE", "#5C39A1"] },
  { id: "magenta", solid: "#FF309B", light: ["#FF77BE", "#E02A88"], dark: ["#FF47A6", "#A21E62"] },
  { id: "gray", solid: "#777777", light: ["#A6A6A6", "#696969"], dark: ["#B7B7B7", "#777777"] },
];

const GROK_COLOR_BY_ID = new Map<string, BloubColorDef>(GROK_COLORS.map((colour) => [colour.id, colour]));

/** Bloub's old colour ids, folded onto the new Grok ids so stored skins keep working. */
const LEGACY_COLOR_ID: Record<string, string> = {
  encre: "black",
  creme: "black",
  brun: "brown",
  rouge: "red",
  orange: "orange",
  ambre: "yellow",
  vert: "green",
  turquoise: "cyan",
  bleu: "blue",
  violet: "violet",
  rose: "magenta",
  gris: "gray",
};

/** Any old or new colour id → a new Grok colour id (unknown → black). */
export function normalizeBloubColor(id: string): string {
  if (GROK_COLOR_BY_ID.has(id)) return id;
  return LEGACY_COLOR_ID[id] ?? "black";
}

function isRecognizedBloubColor(id: string): boolean {
  return GROK_COLOR_BY_ID.has(id) || id in LEGACY_COLOR_ID;
}

function colorDef(id: string): BloubColorDef {
  return GROK_COLOR_BY_ID.get(normalizeBloubColor(id)) ?? GROK_COLOR_BY_ID.get("black")!;
}

/** A colour's light/dark gradient stops (135°); unknown → black. */
export function bloubGradient(id: string, scheme: "light" | "dark"): { from: string; to: string } {
  const def = colorDef(id);
  const [from, to] = scheme === "light" ? def.light : def.dark;
  return { from, to };
}

/** A colour's pure solid; black inverts (dark → white, light → black), others stay their solid. */
export function bloubSolid(id: string, scheme: "light" | "dark" = "dark"): string {
  const def = colorDef(id);
  if (def.id === "black") return scheme === "dark" ? "#FFFFFF" : "#000000";
  return def.solid;
}

/** The midpoint of a colour's scheme gradient. */
export function bloubMid(id: string, scheme: "light" | "dark"): string {
  const { from, to } = bloubGradient(id, scheme);
  return mixHex(from, to, 0.5);
}

/** A CSS value painting the colour's scheme gradient at 135°. */
export function bloubSwatch(id: string, scheme: "light" | "dark"): string {
  const { from, to } = bloubGradient(id, scheme);
  return `linear-gradient(135deg, ${from}, ${to})`;
}

/* ---- legacy Grok gaze constants still consumed by the avatar ---- */

/** Kept for callers that still read the old painted-eye colour. */
export const GROK_EYE_COLOR = "#0b0b0c";
export const GROK_DEFAULT_YAW = 27;
export const GROK_DEFAULT_PITCH = 19;

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

/** Eyes are cutouts now, so no palette paints them. */
export function bloubEyeColor(_palette: BloubPalette = FORK_BLOUB_PALETTE): string | null {
  return null;
}

/** Grok cuts the eyes out of the body; Bloub's own palette keeps its paper holes. */
export function bloubEyeMode(palette: BloubPalette = FORK_BLOUB_PALETTE): "cutout" | "paper" {
  return palette === "bloub" ? "paper" : "cutout";
}

/** A colour id's hex under the chosen palette; Bloub's own table stays in `src/vendor/bloub`. */
/** Bloub's own vendor colour ids, so a Grok colour id still renders when the fork is switched back. */
const NEW_TO_VENDOR: Record<string, string> = {
  black: "encre", brown: "brun", red: "rouge", orange: "orange", yellow: "ambre",
  green: "vert", cyan: "turquoise", blue: "bleu", violet: "violet", magenta: "rose", gray: "gris",
};

export function bloubColorHex(id: string, palette: BloubPalette = FORK_BLOUB_PALETTE): string {
  if (palette === "grok") return bloubSolid(id, "light");
  const vendor = NEW_TO_VENDOR[id] ?? id;
  return COLOR_BY_ID.get(vendor)?.hex ?? "#0a0a0c";
}

/** The swatches for the panel: 11 in Grok's palette, or Bloub's 12 when switched back. */
export function bloubColorChoices(palette: BloubPalette = FORK_BLOUB_PALETTE): ReadonlyArray<{ id: string; hex: string }> {
  if (palette === "grok") return GROK_COLORS.map((colour) => ({ id: colour.id, hex: colour.solid }));
  return COLORS.map((colour) => ({ id: colour.id, hex: colour.hex }));
}

/** The fork hides the expression grid in the avatar panel; expressions stay in code, idle uses neutre. */
export const FORK_HIDE_EXPRESSIONS_IN_PANEL = true;

/** Where the fork plays Bloub's session-state animations. The sidebar tile and the progress avatar above
 * the composer show what the bot is doing; the chat header's profile pill always keeps the bot's own
 * resting face (it may still turn to the pointer), so it never turns into dots or deforms. */
export const FORK_BLOUB_SESSION_ANIMATION = {
  sidebar: true,
  progress: true,
  chatHeader: false,
} as const;
