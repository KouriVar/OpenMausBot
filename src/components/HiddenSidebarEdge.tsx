"use client";
// Fork: the sliver left on the window's edge while the sidebar is hidden. Click it, or drag it to the
// right, to bring the collapsed sidebar back. It is a dozen pixels wide and takes nothing else.
import { useRef } from "react";

import { t } from "@/lib/i18n";

const DRAG_REVEAL = 24;

export function HiddenSidebarEdge({ onReveal }: { onReveal: () => void }) {
  const start = useRef<{ x: number; moved: boolean } | null>(null);
  const label = t("sidebar.revealHidden");
  return (
    <button
      type="button"
      data-hidden-sidebar-edge
      aria-label={label}
      title={label}
      onPointerDown={(event) => {
        start.current = { x: event.clientX, moved: false };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        const grab = start.current;
        if (!grab) return;
        if (event.clientX - grab.x > DRAG_REVEAL) grab.moved = true;
      }}
      onPointerUp={() => {
        const grab = start.current;
        start.current = null;
        if (grab?.moved) onReveal();
      }}
      onClick={() => onReveal()}
      className="group fixed left-0 top-1/2 z-30 flex h-24 w-3 -translate-y-1/2 items-center justify-start pl-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none block h-16 w-[5px] rounded-full bg-ink/25 transition-colors duration-150 group-hover:bg-ink/45 group-active:bg-ink/60"
      />
    </button>
  );
}
