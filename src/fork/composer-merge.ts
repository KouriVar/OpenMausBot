import { useSyncExternalStore } from "react";

/** Settings → Appearance: the Advanced composer's tool buttons behind one + menu, on unless this device turned it off. */
export const MERGED_COMPOSER_KEY = "omb.mergedComposer";
const MERGED_COMPOSER_EVENT = "omb:merged-composer";

const listeners = new Set<() => void>();

function readMergedComposer(): boolean {
  try {
    return localStorage.getItem(MERGED_COMPOSER_KEY) !== "0";
  } catch {
    return true;
  }
}

function subscribe(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => { if (event.key === MERGED_COMPOSER_KEY) listener(); };
  listeners.add(listener);
  window.addEventListener(MERGED_COMPOSER_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener(MERGED_COMPOSER_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useMergedComposer(): boolean {
  return useSyncExternalStore(subscribe, readMergedComposer, () => true);
}

export function setMergedComposer(on: boolean): void {
  try {
    if (on) localStorage.removeItem(MERGED_COMPOSER_KEY);
    else localStorage.setItem(MERGED_COMPOSER_KEY, "0");
  } catch {
    // storage may be blocked; the composer still switches until the page reloads.
  }
  for (const listener of listeners) listener();
  try { window.dispatchEvent(new Event(MERGED_COMPOSER_EVENT)); } catch { /* no window */ }
}
