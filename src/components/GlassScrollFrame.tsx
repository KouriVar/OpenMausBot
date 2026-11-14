import { createContext, useContext, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type GlassEdge = "top" | "bottom";

const EDGES: readonly GlassEdge[] = ["top", "bottom"];

function frameBars(frame: HTMLElement): Partial<Record<GlassEdge, HTMLElement>> {
  const bars: Partial<Record<GlassEdge, HTMLElement>> = {};
  for (const child of Array.from(frame.children)) {
    const edge = (child as HTMLElement).dataset?.glassBar;
    if (edge === "top" || edge === "bottom") bars[edge] = child as HTMLElement;
  }
  return bars;
}

export function publishGlassInsets(frame: HTMLElement): void {
  const bars = frameBars(frame);
  for (const edge of EDGES) {
    const bar = bars[edge];
    frame.style.setProperty(`--glass-${edge}`, `${bar ? Math.ceil(bar.getBoundingClientRect().height) : 0}px`);
  }
}

const StackedFrame = createContext(false);

/** `stacked` puts the bars above and below the scroller instead of floating them over it as glass. The
 * list is clipped hard at both edges: no band, gradient or shadow is drawn over it. */
export function GlassScrollFrame({ className, children, stacked = false, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode; stacked?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const apply = () => publishGlassInsets(frame);
    const resize = new ResizeObserver(apply);
    const watch = () => {
      resize.disconnect();
      for (const bar of Object.values(frameBars(frame))) if (bar) resize.observe(bar);
      apply();
    };
    watch();
    const children = new MutationObserver(watch);
    children.observe(frame, { childList: true });
    return () => {
      resize.disconnect();
      children.disconnect();
    };
  }, []);
  return (
    <StackedFrame.Provider value={stacked}>
      <div ref={ref} data-glass-frame="" className={cn("relative min-h-0", stacked && "flex flex-col", className)} {...rest}>
        {children}
      </div>
    </StackedFrame.Provider>
  );
}

/** `fade` trades the glass for a plain fade into the canvas: what scrolls under the bar melts away towards the edge. */
export function GlassBar({ edge, fade, className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { edge: GlassEdge; fade?: boolean; children: ReactNode }) {
  const stacked = useContext(StackedFrame);
  return (
    <div
      data-glass-bar={edge}
      data-glass-fade={fade ? "" : undefined}
      className={cn(stacked ? "relative z-10 shrink-0" : cn("glass-bar absolute inset-x-0 z-10", edge === "top" ? "top-0" : "bottom-0"), className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function GlassScroller({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const stacked = useContext(StackedFrame);
  if (!stacked) {
    return (
      <div className={cn("glass-scroller h-full overflow-y-auto", className)} {...rest}>
        <div className="glass-scroller-content">{children}</div>
      </div>
    );
  }
  // A stacked list simply ends at the bar's edge: the scrollport itself is the clip.
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto", className)} {...rest}>
      <div>{children}</div>
    </div>
  );
}
