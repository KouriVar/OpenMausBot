// Fork UI batch 2026-11-10: purely presentational. Every change below is switched on by these constants and
// touches no data, no server and no behaviour; flipping a constant back restores the previous look.
import { useCallback, useEffect, useState, type CSSProperties } from "react";

export const FORK_UI_1110 = true;

/** The one row radius, shared by bot rows and group rows. `--radius-xl` is the token bot rows already used. */
export const ROW_RADIUS = "rounded-xl";
/** Simple mode's 54px rows use the smaller step; both row kinds take it from here. */
export const ROW_RADIUS_SIMPLE = "rounded-[8px]";

/** Message previews keep their size and take one weight step up, so the row's title stays the heavier line. */
export const ROW_PREVIEW = "text-[11px] font-medium";
export const ROW_PREVIEW_SIMPLE = "text-[13px] font-medium leading-[18px]";

/** The chief's card in Simple's expanded sidebar: one size step bigger and squared to the row radius. */
export const HERO_AVATAR_BUMP = 4;

/** Bold text preference (Settings → Appearance). Stored outside the store so it applies before the first paint. */
export const BOLD_TEXT_KEY = "omb.fork.boldText";
export const BOLD_TEXT_EVENT = "omb:bold-text";

export function readBoldText(): boolean {
  try {
    return localStorage.getItem(BOLD_TEXT_KEY) === "1";
  } catch {
    return false;
  }
}

export function applyBoldText(on: boolean): void {
  try {
    localStorage.setItem(BOLD_TEXT_KEY, on ? "1" : "0");
  } catch {
  }
  const root = document.documentElement;
  if (on) root.setAttribute("data-fork-bold-text", "on");
  else root.removeAttribute("data-fork-bold-text");
  try {
    window.dispatchEvent(new CustomEvent(BOLD_TEXT_EVENT, { detail: on }));
  } catch {
  }
}

/** Reads the saved choice, keeps the document attribute in step, and re-reads when Settings flips it. */
export function useBoldText(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(readBoldText);
  useEffect(() => {
    const sync = () => setOn(readBoldText());
    applyBoldText(readBoldText());
    window.addEventListener(BOLD_TEXT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BOLD_TEXT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const choose = useCallback((next: boolean) => {
    setOn(next);
    applyBoldText(next);
  }, []);
  return [on, choose];
}

/** Relative luminance of a #rrggbb colour, for choosing readable text on it. */
function luminance(hex: string): number {
  const value = hex.trim().replace("#", "");
  const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  const [r, g, b] = [0, 2, 4].map((at) => Number.parseInt(full.slice(at, at + 2), 16) / 255);
  const channel = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r ?? 0) + 0.7152 * channel(g ?? 0) + 0.0722 * channel(b ?? 0);
}

/** Black or white text for an accent, by contrast ratio: a black avatar keeps white text even on a light skin. */
export function accentInk(accent: string): string {
  const light = luminance(accent);
  const withWhite = 1.05 / (light + 0.05);
  const withBlack = (light + 0.05) / 0.05;
  return withBlack >= withWhite ? "#111111" : "#ffffff";
}

/** The bot's Bloub accent as two CSS variables, consumed by the panels' own accent surfaces. */
export function botAccentStyle(accent: string | undefined): CSSProperties | undefined {
  if (!accent) return undefined;
  return { "--bot-accent": accent, "--bot-accent-ink": accentInk(accent) } as CSSProperties;
}

/** Marks a panel that draws with `--bot-accent`, falling back to the skin's accent when the fork draws the mascot. */
export const BOT_ACCENT_ON = "[--bot-accent:var(--color-accent)] [--bot-accent-ink:var(--color-accent-ink)]";
