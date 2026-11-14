// Fork: Settings → Appearance's brand mark switch. On by default; saved on this device and read by the sidebar
// without a reload, so turning it off takes the wordmark and its two gaps away and the list moves up.
import { useSyncExternalStore } from "react";

export const BRAND_MARK_KEY = "omb.fork.brandMark";
const EVENT = "omb:brand-mark";

let listeners = new Set<() => void>();

function store(): Storage | undefined {
  try {
    return globalThis.window?.localStorage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function readBrandMark(): boolean {
  try {
    return store()?.getItem(BRAND_MARK_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setBrandMark(on: boolean): void {
  try {
    store()?.setItem(BRAND_MARK_KEY, on ? "1" : "0");
  } catch {
  }
  emit();
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

export function useBrandMark(): boolean {
  return useSyncExternalStore(subscribe, readBrandMark, () => true);
}
