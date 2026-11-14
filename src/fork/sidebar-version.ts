// Fork: the version line in the account menu. On by default; saved on this device and read by the menu without a
// reload, so turning it off takes the line away and leaves no gap behind.
import { useSyncExternalStore } from "react";

export const SIDEBAR_VERSION_KEY = "omb.fork.sidebarVersion";
/** The switch stays in code, but 0.8.1's account menu has no separate version line to show or hide. */
export const SIDEBAR_VERSION_SETTING_SHOWN = false;
const EVENT = "omb:sidebar-version";

const listeners = new Set<() => void>();

function storage(): Storage | undefined {
  try {
    return globalThis.window?.localStorage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function read(): boolean {
  try {
    return storage()?.getItem(SIDEBAR_VERSION_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setSidebarVersion(on: boolean): void {
  try {
    storage()?.setItem(SIDEBAR_VERSION_KEY, on ? "1" : "0");
  } catch {
  }
  for (const listener of listeners) listener();
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: on }));
  } catch {
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSidebarVersion(): boolean {
  return useSyncExternalStore(subscribe, read, () => true);
}
