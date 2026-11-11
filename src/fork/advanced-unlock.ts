import { useSyncExternalStore } from "react";

/** Fork: Advanced mode is off by default and has no switch. The updates page's app icon takes FORK_ADVANCED_UNLOCK_TAPS
 * clicks to reveal a switch; turning that switch off hides it again. Only this device remembers it (localStorage), so a
 * friend's install stays Simple until they find the same spot. */
export const FORK_ADVANCED_UNLOCK = true;
export const FORK_ADVANCED_UNLOCK_TAPS = 10;

const UNLOCK_KEY = "omb-advanced-unlocked";

let listeners = new Set<() => void>();

/** The window's storage: a bare `globalThis.localStorage` is Node's own stub in a test run. */
function store(): Storage | undefined {
  try {
    return globalThis.window?.localStorage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readAdvancedUnlocked(): boolean {
  try {
    return store()?.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAdvancedUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) store()?.setItem(UNLOCK_KEY, "1");
    else store()?.removeItem(UNLOCK_KEY);
  } catch {
  }
  emit();
}

export function useAdvancedUnlocked(): boolean {
  // No SSR here: the same reader serves as the server snapshot, so a static render shows what the window shows.
  return useSyncExternalStore(subscribe, readAdvancedUnlocked, readAdvancedUnlocked);
}
