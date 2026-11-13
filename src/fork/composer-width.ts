import { useEffect, type RefObject } from "react";

import { FORK_UI_1110B } from "./ui-batch-1110b";

/** Fork: bubbles cap at the composer's own width, so they line up with the input instead of running a few pixels past
 * it. One shared `--composer-width` property, read by the transcript, so nothing is measured per bubble. */
export function useComposerWidth(shell: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!FORK_UI_1110B) return;
    const element = shell.current;
    if (!element) return;
    const apply = () => document.documentElement.style.setProperty("--composer-width", `${Math.round(element.getBoundingClientRect().width)}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--composer-width");
    };
  }, [shell]);
}
