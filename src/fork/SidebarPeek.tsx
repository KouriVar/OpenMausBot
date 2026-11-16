// Fork: resting on the hidden sidebar's edge handle brings the bar back as a floating preview. It is the same
// Sidebar, one hover away, and it never writes the saved "hidden" state: leaving puts it away again.
import { useCallback, useEffect, useRef, useState } from "react";

import { HiddenSidebarEdge } from "@/components/HiddenSidebarEdge";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/cn";

const HOVER_MS = 1000;
const LEAVE_MS = 300;
const MOTION_MS = 180;

function reducedMotion(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.dataset.reducedMotion === "true") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A menu the preview opened keeps it up: the pointer may be on rows that live outside it, in a portal. */
function menuOpen(): boolean {
  const nodes = document.querySelectorAll<HTMLElement>('[role="menu"], [role="listbox"], [role="alertdialog"], [role="dialog"][aria-modal="true"]');
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    if (rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none") return true;
  }
  return false;
}

export function SidebarPeek({ onReveal }: { onReveal: () => void }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hoverTimer = useRef<number | null>(null);
  const leaveTimer = useRef<number | null>(null);

  const clearTimer = (timer: { current: number | null }) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    if (reducedMotion()) {
      setMounted(false);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), MOTION_MS);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  const close = useCallback(() => {
    clearTimer(leaveTimer);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => () => {
    clearTimer(hoverTimer);
    clearTimer(leaveTimer);
  }, []);

  const enter = () => {
    clearTimer(leaveTimer);
    if (open || hoverTimer.current !== null) return;
    hoverTimer.current = window.setTimeout(() => {
      hoverTimer.current = null;
      setOpen(true);
    }, HOVER_MS);
  };

  const leave = () => {
    clearTimer(hoverTimer);
    if (!open) return;
    clearTimer(leaveTimer);
    const ask = () => {
      if (menuOpen()) {
        leaveTimer.current = window.setTimeout(ask, LEAVE_MS);
        return;
      }
      leaveTimer.current = null;
      setOpen(false);
    };
    leaveTimer.current = window.setTimeout(ask, LEAVE_MS);
  };

  return (
    <div
      data-sidebar-peek=""
      className="pointer-events-none fixed inset-0 z-40"
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      <div className="pointer-events-auto">
        <HiddenSidebarEdge onReveal={onReveal} />
      </div>
      {mounted && (
        <div
          data-sidebar-peek-panel=""
          onPointerEnter={() => clearTimer(leaveTimer)}
          className={cn(
            "pointer-events-auto absolute bottom-2 left-2 top-2 overflow-hidden rounded-[var(--inset-radius)] bg-panel/60 ring-[0.5px] ring-ink/10 shadow-(--shadow-float) backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:rounded-[var(--inset-radius)] before:bg-white/[0.055] before:content-['']",
            open
              ? "motion-safe:animate-[sidebar-peek-in_180ms_ease-out]"
              : "motion-safe:animate-[sidebar-peek-out_180ms_ease-out_forwards]",
          )}
        >
          <Sidebar open={false} reveal={false} onClose={() => {}} />
        </div>
      )}
    </div>
  );
}
