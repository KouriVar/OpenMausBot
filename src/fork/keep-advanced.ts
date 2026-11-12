import { useSyncExternalStore } from "react";

/** Fork: keep Advanced mode across restarts and updates. Off by default: the app then starts Simple as before.
 *
 * The mode itself is still stored under omb-advanced-mode; this switch only decides whether the Simple-only boot
 * throws that key away (see settleInterfaceMode in lib/new-look.ts). */
export const KEEP_ADVANCED_KEY = "omb-keep-advanced";

const listeners = new Set<() => void>();

function storage(): Storage | undefined {
  try {
    return globalThis.window?.localStorage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readKeepAdvanced(): boolean {
  try {
    return storage()?.getItem(KEEP_ADVANCED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setKeepAdvanced(keep: boolean): void {
  try {
    if (keep) storage()?.setItem(KEEP_ADVANCED_KEY, "1");
    else storage()?.removeItem(KEEP_ADVANCED_KEY);
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

export function useKeepAdvanced(): boolean {
  return useSyncExternalStore(subscribe, readKeepAdvanced, () => false);
}
