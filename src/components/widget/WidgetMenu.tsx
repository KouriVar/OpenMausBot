import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";
import { useMenuMotion } from "../MenuMotion";
import { MENU_SHEET } from "../menu-recipe";

/** A field's popup, drawn on the app's menu surface: below its anchor, or above it when the window's foot is near. */
export function WidgetMenu({ anchor, open, onClose, children, minWidth = 200, role = "listbox", label }: {
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  minWidth?: number;
  role?: "listbox" | "dialog";
  label?: string;
}) {
  const motion = useMenuMotion(open);
  const panel = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ left: number; top: number; width: number }>();
  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.max(rect.width, minWidth);
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
    const height = panel.current?.getBoundingClientRect().height ?? 280;
    const top = rect.bottom + 4 + Math.min(height, 320) <= window.innerHeight - 8 ? rect.bottom + 4 : Math.max(8, rect.top - Math.min(height, 320) - 4);
    setBox({ left, top, width });
  }, [anchor, minWidth, open]);
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || panel.current?.contains(event.target) || anchor?.contains(event.target)) return;
      onClose();
    };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("pointerdown", away, true);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", away, true);
      window.removeEventListener("keydown", key);
    };
  }, [anchor, onClose, open]);
  if (!motion.shown || !anchor) return null;
  return createPortal(
    <div ref={panel} role={role} aria-label={label} {...motion.exitProps} className={cn(MENU_SHEET, "fixed z-[75] max-h-[min(320px,calc(100vh-16px))] overflow-y-auto", motion.className)}
      style={{ left: box?.left, top: box?.top, width: box?.width, visibility: box ? undefined : "hidden" }}>
      {children}
    </div>,
    document.body,
  );
}
