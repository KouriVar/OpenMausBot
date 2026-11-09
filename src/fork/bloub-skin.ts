import { useSyncExternalStore } from "react";

import type { MausColor } from "@/lib/mascot";
import { EXPRESSION_BY_ID } from "@/vendor/bloub/expressions";
import { COLOR_BY_ID, SHAPE_BY_ID, type ColorId, type ShapeId } from "@/vendor/bloub/skins";
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
