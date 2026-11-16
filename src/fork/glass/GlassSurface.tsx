import { Component, useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import LiquidGlass from "liquid-glass-react";

import { cn } from "@/lib/cn";

/** Settings → Appearance: the chat head's glass, on unless this device turned it off. */
export const GLASS_PILL_KEY = "omb.glassPill";
const GLASS_PILL_EVENT = "omb:glass-pill";

const listeners = new Set<() => void>();

function readGlassPill(): boolean {
  try {
    return localStorage.getItem(GLASS_PILL_KEY) !== "0";
  } catch {
    return true;
  }
}

function subscribe(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => { if (event.key === GLASS_PILL_KEY) listener(); };
  listeners.add(listener);
  window.addEventListener(GLASS_PILL_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener(GLASS_PILL_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useGlassPill(): boolean {
  return useSyncExternalStore(subscribe, readGlassPill, () => true);
}

export function setGlassPill(on: boolean): void {
  try {
    if (on) localStorage.removeItem(GLASS_PILL_KEY);
    else localStorage.setItem(GLASS_PILL_KEY, "0");
  } catch {
    // storage may be blocked; the switch still applies until the page reloads.
  }
  for (const listener of listeners) listener();
  try { window.dispatchEvent(new Event(GLASS_PILL_EVENT)); } catch { /* no window */ }
}

/** A system preference that asks for less of the effect. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && Boolean(window.matchMedia?.(query).matches));
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia(query);
    const change = () => setMatches(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, [query]);
  return matches;
}

/** Catches a WebGL/shader failure inside the library and lets the pill fall back to CSS. */
class GlassBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  componentDidCatch(): void { this.props.onError(); }
  render(): ReactNode { return this.state.failed ? null : this.props.children; }
}

export interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** The pill's own radius, passed to the shader's edge. */
  cornerRadius?: number;
}

/** A liquid-glass surface with a CSS fallback: reduced transparency/motion, a failed shader, or the setting off. */
const USE_LIQUID_LIBRARY = false;

export function GlassSurface({ children, className, style, cornerRadius = 999 }: GlassSurfaceProps) {
  const enabled = useGlassPill();
  const lessTransparency = useMediaQuery("(prefers-reduced-transparency: reduce)");
  const lessMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const reduced = lessTransparency || lessMotion;
  const [failed, setFailed] = useState(false);
  const fallback = !USE_LIQUID_LIBRARY || !enabled || reduced || failed;
  if (fallback) {
    return <div data-glass-fallback="" className={cn("glass-pill-surface", className)} style={style}>{children}</div>;
  }
  return (
    <GlassBoundary onError={() => setFailed(true)}>
      <LiquidGlass
        className={cn("glass-pill-liquid", className)}
        style={style}
        cornerRadius={cornerRadius}
        padding="0"
        displacementScale={42}
        blurAmount={0.08}
        saturation={145}
        aberrationIntensity={1.4}
        elasticity={0}
        mode="standard"
      >
        {children}
      </LiquidGlass>
    </GlassBoundary>
  );
}
