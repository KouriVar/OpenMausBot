// Fork: the app's two layouts. Classic puts the sidebar and the content side by side, edge to edge; Inset keeps the
// sidebar as the window's ground and turns the whole content area — the chat and whatever panel is open beside it — into
// one rounded card on a soft ground. Display only: no data, no server.
import { useCallback, useEffect, useState } from "react";

export const INSET_LAYOUT_KEY = "omb.fork.insetLayout";
export const INSET_LAYOUT_EVENT = "omb:inset-layout";

export type AppLayout = "classic" | "inset";
export const APP_LAYOUTS: readonly AppLayout[] = ["classic", "inset"];
export const DEFAULT_APP_LAYOUT: AppLayout = "classic";

export function readInsetLayout(): AppLayout {
  try {
    return localStorage.getItem(INSET_LAYOUT_KEY) === "inset" ? "inset" : DEFAULT_APP_LAYOUT;
  } catch {
    return DEFAULT_APP_LAYOUT;
  }
}

/** Puts the layout on the document, where the styles that draw the card read it. */
export function applyInsetLayout(layout: AppLayout): void {
  document.documentElement.setAttribute("data-inset-layout", layout);
}

export function setInsetLayout(layout: AppLayout): void {
  try {
    localStorage.setItem(INSET_LAYOUT_KEY, layout);
  } catch {
  }
  applyInsetLayout(layout);
  try {
    window.dispatchEvent(new CustomEvent(INSET_LAYOUT_EVENT, { detail: layout }));
  } catch {
  }
}

export function useInsetLayout(): { layout: AppLayout; inset: boolean; choose: (layout: AppLayout) => void } {
  const [layout, setLayout] = useState<AppLayout>(() => readInsetLayout());
  const refresh = useCallback(() => setLayout(readInsetLayout()), []);
  useEffect(() => {
    refresh();
    window.addEventListener(INSET_LAYOUT_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(INSET_LAYOUT_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return { layout, inset: layout === "inset", choose: setInsetLayout };
}
