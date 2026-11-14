// Fork: Settings → General's "Mark ambiguity before sending". Off by default; saved on this device and read by the
// composer live, so flipping it takes effect on the next pause in typing.
import { useSyncExternalStore } from "react";

export const MARK_AMBIGUITY_KEY = "omb.fork.markAmbiguity";
const EVENT = "omb:mark-ambiguity";
const listeners = new Set<() => void>();

function storage(): Storage | undefined {
  try {
    return globalThis.window?.localStorage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readMarkAmbiguity(): boolean {
  try {
    return storage()?.getItem(MARK_AMBIGUITY_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMarkAmbiguity(on: boolean): void {
  try {
    storage()?.setItem(MARK_AMBIGUITY_KEY, on ? "1" : "0");
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

export function useMarkAmbiguity(): boolean {
  return useSyncExternalStore(subscribe, readMarkAmbiguity, () => false);
}
