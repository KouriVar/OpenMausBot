// Fork: the sidebar's system vibrancy. macOS only, on by default: the window's left column shows the wallpaper's blurred
// colours through it, like Finder and Aside, while the chat pane keeps its solid ground. The window itself asks the system
// for the material (electron/main.mjs); this decides whether the page lets it show, and it does so live, with no restart.
import { useCallback, useEffect, useState } from "react";

export const SIDEBAR_VIBRANCY_KEY = "omb.fork.sidebarVibrancy";
export const SIDEBAR_VIBRANCY_EVENT = "omb:sidebar-vibrancy";

/** How much of the wallpaper shows: 100 is the system material alone, 20 is the most colour over it. */
export const GLASS_TRANSPARENCY = [20, 40, 60, 80, 100] as const;
export type GlassTransparency = (typeof GLASS_TRANSPARENCY)[number];
export const GLASS_TRANSPARENCY_KEY = "omb.fork.sidebarGlass";
export const GLASS_TRANSPARENCY_DEFAULT: GlassTransparency = 60;

/** The colour laid over the material: the theme's own panel, or white or black whatever the theme is. */
export const GLASS_OVERLAYS = ["auto", "light", "dark"] as const;
export type GlassOverlay = (typeof GLASS_OVERLAYS)[number];
export const GLASS_OVERLAY_KEY = "omb.fork.sidebarOverlay";
export const GLASS_OVERLAY_DEFAULT: GlassOverlay = "auto";

/** Whether this window can show it: the desktop app on a Mac. Browsers and the other platforms keep the solid sidebar. */
export function vibrancyAvailable(): boolean {
  if (typeof window === "undefined") return false;
  // The preload's platform is the one the window's material was asked for; a browser has none.
  return window.ogb?.platform === "darwin";
}

export function readSidebarVibrancy(): boolean {
  if (!vibrancyAvailable()) return false;
  try {
    return localStorage.getItem(SIDEBAR_VIBRANCY_KEY) !== "0";
  } catch {
    return true;
  }
}

function readNumber(key: string, fallback: GlassTransparency): GlassTransparency {
  try {
    const raw = Number(localStorage.getItem(key));
    return (GLASS_TRANSPARENCY as readonly number[]).includes(raw) ? (raw as GlassTransparency) : fallback;
  } catch {
    return fallback;
  }
}

function readOverlay(): GlassOverlay {
  try {
    const raw = localStorage.getItem(GLASS_OVERLAY_KEY);
    return (GLASS_OVERLAYS as readonly string[]).includes(raw ?? "") ? (raw as GlassOverlay) : GLASS_OVERLAY_DEFAULT;
  } catch {
    return GLASS_OVERLAY_DEFAULT;
  }
}

export const readGlassTransparency = (): GlassTransparency => readNumber(GLASS_TRANSPARENCY_KEY, GLASS_TRANSPARENCY_DEFAULT);
export const readGlassOverlay = (): GlassOverlay => readOverlay();

/** Puts the choices on the document, where the styles that let the material through read them. */
export function applySidebarVibrancy(on: boolean): void {
  const root = document.documentElement;
  if (on && vibrancyAvailable()) root.setAttribute("data-sidebar-vibrancy", "on");
  else root.removeAttribute("data-sidebar-vibrancy");
  root.setAttribute("data-sidebar-glass", String(readGlassTransparency()));
  root.setAttribute("data-sidebar-overlay", readGlassOverlay());
}

export function setGlassTransparency(value: GlassTransparency): void {
  try {
    localStorage.setItem(GLASS_TRANSPARENCY_KEY, String(value));
  } catch {
  }
  applySidebarVibrancy(readSidebarVibrancy());
  try {
    window.dispatchEvent(new CustomEvent(SIDEBAR_VIBRANCY_EVENT));
  } catch {
  }
}

export function setGlassOverlay(value: GlassOverlay): void {
  try {
    localStorage.setItem(GLASS_OVERLAY_KEY, value);
  } catch {
  }
  applySidebarVibrancy(readSidebarVibrancy());
  try {
    window.dispatchEvent(new CustomEvent(SIDEBAR_VIBRANCY_EVENT));
  } catch {
  }
}

export function setSidebarVibrancy(on: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_VIBRANCY_KEY, on ? "1" : "0");
  } catch {
  }
  applySidebarVibrancy(on);
  try {
    window.dispatchEvent(new CustomEvent(SIDEBAR_VIBRANCY_EVENT, { detail: on }));
  } catch {
  }
}

export function useSidebarVibrancy(): {
  available: boolean;
  on: boolean;
  choose: (on: boolean) => void;
  transparency: GlassTransparency;
  setTransparency: (value: GlassTransparency) => void;
  overlay: GlassOverlay;
  setOverlay: (value: GlassOverlay) => void;
} {
  const available = vibrancyAvailable();
  const [on, setOn] = useState<boolean>(() => readSidebarVibrancy());
  const [transparency, setTransparency] = useState<GlassTransparency>(() => readGlassTransparency());
  const [overlay, setOverlay] = useState<GlassOverlay>(() => readGlassOverlay());
  const refresh = useCallback(() => {
    setOn(readSidebarVibrancy());
    setTransparency(readGlassTransparency());
    setOverlay(readGlassOverlay());
  }, []);
  useEffect(() => {
    refresh();
    window.addEventListener(SIDEBAR_VIBRANCY_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SIDEBAR_VIBRANCY_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return { available, on, choose: setSidebarVibrancy, transparency, setTransparency: setGlassTransparency, overlay, setOverlay: setGlassOverlay };
}
