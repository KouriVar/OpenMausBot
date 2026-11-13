// Fork: the sidebar's system vibrancy. macOS only, on by default: the window's left column shows the wallpaper's blurred
// colours through it, like Finder and Aside, while the chat pane keeps its solid ground. The window itself asks the system
// for the material (electron/main.mjs); this decides whether the page lets it show, and it does so live, with no restart.
import { useCallback, useEffect, useState } from "react";

export const SIDEBAR_VIBRANCY_KEY = "omb.fork.sidebarVibrancy";
export const SIDEBAR_VIBRANCY_EVENT = "omb:sidebar-vibrancy";

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

/** Puts the choice on the document, where the styles that let the material through read it. */
export function applySidebarVibrancy(on: boolean): void {
  const root = document.documentElement;
  if (on && vibrancyAvailable()) root.setAttribute("data-sidebar-vibrancy", "on");
  else root.removeAttribute("data-sidebar-vibrancy");
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

export function useSidebarVibrancy(): { available: boolean; on: boolean; choose: (on: boolean) => void } {
  const available = vibrancyAvailable();
  const [on, setOn] = useState<boolean>(() => readSidebarVibrancy());
  const refresh = useCallback(() => setOn(readSidebarVibrancy()), []);
  useEffect(() => {
    refresh();
    window.addEventListener(SIDEBAR_VIBRANCY_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SIDEBAR_VIBRANCY_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return { available, on, choose: setSidebarVibrancy };
}
