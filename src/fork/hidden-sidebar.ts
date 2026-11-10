// Fork: hide the whole sidebar behind an edge handle on the window's left edge. The choice persists; the
// master switch keeps the feature easy to remove in one line.
import { useCallback, useSyncExternalStore } from "react";

export const FORK_HIDDEN_SIDEBAR = true;

const KEY = "omb.fork.hiddenSidebar";
const EVENT = "omb:hidden-sidebar";

function read(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
function write(hidden: boolean): void {
  try { if (hidden) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch {}
  try { window.dispatchEvent(new Event(EVENT)); } catch {}
}

function subscribe(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useHiddenSidebar(): [boolean, (hidden: boolean) => void] {
  const hidden = useSyncExternalStore(subscribe, read, () => false);
  const choose = useCallback((next: boolean) => write(next), []);
  return [hidden, choose];
}
