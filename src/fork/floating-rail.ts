// Fork: a floating, draggable avatar bar for the collapsed sidebar. Off by default; the constant is the
// single switch, and every choice lives in localStorage so it survives a restart.
import { useCallback, useSyncExternalStore } from "react";

/** Master switch for the feature; the person's own choice (below) still defaults to off. */
export const FORK_FLOATING_RAIL = true;

const ON_KEY = "omb.fork.floatingRail";
const SIDE_KEY = "omb.fork.floatingRailSide";
const EVENT = "omb:floating-rail";

export type FloatingSide = "left" | "right";

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null): void {
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch {}
  try { window.dispatchEvent(new Event(EVENT)); } catch {}
}

export const isFloatingRailOn = (): boolean => read(ON_KEY) === "1";
export const floatingRailSide = (): FloatingSide => (read(SIDE_KEY) === "right" ? "right" : "left");

export function setFloatingRail(on: boolean): void {
  write(ON_KEY, on ? "1" : null);
}
export function setFloatingRailSide(side: FloatingSide): void {
  write(SIDE_KEY, side);
}

function subscribe(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useFloatingRail(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, isFloatingRailOn, () => false);
  const choose = useCallback((next: boolean) => setFloatingRail(next), []);
  return [on, choose];
}

export function useFloatingRailSide(): [FloatingSide, (side: FloatingSide) => void] {
  const side = useSyncExternalStore(subscribe, floatingRailSide, (): FloatingSide => "left");
  const choose = useCallback((next: FloatingSide) => setFloatingRailSide(next), []);
  return [side, choose];
}
