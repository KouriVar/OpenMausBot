import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { NOTIF_BLUE, type DotRender } from "@/vendor/bloub/decor";
import { BotEngine, type BotFrame } from "@/vendor/bloub/engine";
import { DEFAULT_EXPRESSION, EXPRESSION_BY_ID } from "@/vendor/bloub/expressions";
import { liveliness } from "@/vendor/bloub/face";
import { DEMI_VIEWBOX, RAYON } from "@/vendor/bloub/repere";
import { DEFAULT_COLOR, DEFAULT_SHAPE, mixHex } from "@/vendor/bloub/skins";
import { POSES, STATE_BY_ID, type StateId } from "@/vendor/bloub/states";
import { TURN_TIME, followLook } from "@/fork/bloub-gaze";
import { bloubColorHex, bloubEyeColor, GROK_DEFAULT_YAW, GROK_DEFAULT_PITCH } from "@/fork/bloub-skin";
import { bloubShapeRadii } from "@/fork/bloub-shapes";
import { BLOUB_MIN_BLOCK, stateSwitchDelay } from "@/fork/bloub-session";

/** The app's bot states on Bloub's own; anything else rests. */
const STATE_BY_MAUS: Record<string, StateId> = {
  idle: "idle",
  thinking: "thinking",
  working: "thinking",
  loading: "thinking",
  alerting: "alert",
  alert: "alert",
  surprised: "wide",
  happy: "wink",
  success: "wink",
  proud: "wink",
  celebrate: "burst",
  sleeping: "sleep",
  spawning: "swirl",
  arrive: "swirl",
};

export function bloubState(mausState: string | undefined): StateId {
  if (!mausState) return "idle";
  if (STATE_BY_ID.has(mausState as StateId)) return mausState as StateId;
  return STATE_BY_MAUS[mausState] || "idle";
}

/** A lone large avatar gets the full frame rate; everything animated runs at 60fps now. */
export const BLOUB_SINGLE_SIZE = 96;

/** Degrees the body leans and pixels it drifts toward the pointer (Grok's own little lean). */
const LEAN_DEG = 6;
const DRIFT_PX = 2.5;
/** Chasing: stiff, ~120-180ms to arrive. Coming home: softer, with a small rebound. */
const CHASE_K = 260;
const CHASE_C = 24;
const HOME_K = 140;
const HOME_C = 16;

export type BloubAvatarHandle = {
  blink: () => void;
  spin: (durationMs?: number) => void;
  setExpression: (index: number) => void;
};

export type BloubAvatarProps = {
  size?: number;
  shape?: string;
  colorId?: string;
  expression?: string;
  state?: string;
  animated?: boolean;
  /** Renders this instant instead of a clock: one reproducible picture. */
  frozenAt?: number;
  /** The surface behind the eye holes; falls back to the page's own colour. */
  paper?: string;
  label?: string;
  /** Draw the body to the edges of the box (the small sidebar/composer faces), not the ring's framing. */
  fitBody?: boolean;
  /** The tile the body sits in, so the body is `size` and the box `frameSize`; also the hit area. */
  frameSize?: number;
  /** The element whose whole rectangle is the hover target (the row tile, the header pill). */
  hitRef?: React.RefObject<HTMLElement | null>;
  /** Palette override: the comparison suite renders Bloub's own colours, the app uses Grok's. */
  palette?: "grok" | "bloub";
  /** A thin outline following the body, for the selected tile in the panel. */
  outlineColor?: string;
};

/* ------------------------------------------------------------ one clock */

const frameListeners = new Set<(clock: number) => void>();
let clock = 0;
let raf = 0;
let last = 0;

function tick(now: number) {
  const dt = last ? Math.min((now - last) / 1000, 0.064) : 0;
  last = now;
  clock += dt;
  for (const listener of frameListeners) listener(clock);
  raf = requestAnimationFrame(tick);
}

function subscribeFrames(listener: (clock: number) => void): () => void {
  frameListeners.add(listener);
  if (!raf) {
    last = 0;
    raf = requestAnimationFrame(tick);
  }
  return () => {
    frameListeners.delete(listener);
    if (frameListeners.size === 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true,
  );
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setReduced(query.matches);
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

/** Relative luminance of a #rgb/#rrggbb, so the eye holes can be tinted against the body. */
function luminance(hex: string): number {
  const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const value = Number.parseInt(full.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

/** The eye holes are punched through the body, so what shows through must contrast with the ink — a light
 * paper on a dark body, a dark one on a pale body — in either theme. */
function resolvePaper(given: string | undefined, ink: string): string {
  if (given && /^#[0-9a-f]{3,8}$/i.test(given)) return given;
  return luminance(ink) < 0.45 ? "#f9f9f9" : "#101410";
}

function usePaper(given: string | undefined, ink: string): string {
  const [paper, setPaper] = useState(() => resolvePaper(given, ink));
  useEffect(() => { setPaper(resolvePaper(given, ink)); }, [given, ink]);
  return paper;
}

function safeMix(from: string, to: string, t: number): string {
  try {
    const out = mixHex(from, to, t);
    return /^#[0-9a-f]{6}$/i.test(out) ? out : to;
  } catch {
    return to;
  }
}

function closedEyeTime(from: number, span = 6): number {
  let best = from;
  let lowest = 1;
  for (let step = 0; step <= span * 30; step += 1) {
    const at = from + step / 30;
    const lid = liveliness(at, { blink: true }).lid;
    if (lid < lowest) {
      lowest = lid;
      best = at;
    }
  }
  return best;
}

function dotFill(dot: DotRender, ink: string, paper: string): { fill: string; fillOpacity?: number } {
  if (dot.color) return { fill: dot.color };
  if (dot.depth === undefined) return { fill: ink };
  return { fill: safeMix(paper, ink, dot.depth) };
}

/** One axis of a damped spring, stepped by the engine's own frame clock. */
function stepSpring(position: number, velocity: number, target: number, dt: number, k: number, c: number): [number, number] {
  const acceleration = k * (target - position) - c * velocity;
  const nextVelocity = velocity + acceleration * dt;
  return [position + nextVelocity * dt, nextVelocity];
}

export const BloubAvatar = forwardRef<BloubAvatarHandle, BloubAvatarProps>(function BloubAvatar(
  {
    size = 44,
    shape = DEFAULT_SHAPE,
    colorId = DEFAULT_COLOR,
    expression = DEFAULT_EXPRESSION,
    state,
    animated = true,
    frozenAt,
    paper,
    label,
    fitBody = false,
    frameSize,
    hitRef,
    palette,
    outlineColor,
  },
  ref,
) {
  const reduced = useReducedMotion();
  const stateId = bloubState(state);
  const shapes = bloubShapeRadii(shape);
  const expr = EXPRESSION_BY_ID.get(expression) ?? null;
  const ink = bloubColorHex(colorId, palette);
  const eyeFill = bloubEyeColor(palette) ?? null;
  const baseYaw = palette === "grok" ? GROK_DEFAULT_YAW : 0;
  const basePitch = palette === "grok" ? GROK_DEFAULT_PITCH : 0;
  const surface = usePaper(paper, ink);

  const engine = useRef<BotEngine | null>(null);
  if (!engine.current) engine.current = new BotEngine(RAYON, stateId, shapes, expr);

  const [hovering, setHovering] = useState(false);
  const [settling, setSettling] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointer = useRef<{ nx: number; ny: number } | null>(null);
  const aiming = useRef(false);
  const spring = useRef({ x: 0, y: 0, vx: 0, vy: 0, lean: 0, vLean: 0 });
  const lastSwitch = useRef(-BLOUB_MIN_BLOCK);
  const pendingState = useRef<string | null>(null);
  const queueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeState = stateId !== "idle";
  const canAnimate = frozenAt === undefined && !reduced;
  const live = canAnimate && (hovering || settling || (animated && activeState));
  const fps = 60;
  // A small face may lean only when it has room to (the sidebar tile); in a tight pill it just turns its head.
  const canLean = fitBody || size >= 48;
  const cssSize = fitBody ? (frameSize ?? size) : size;
  const half = fitBody ? (RAYON * cssSize) / Math.max(1, size) : size < 48 ? RAYON : DEMI_VIEWBOX;
  const unitsPerPx = (half * 2) / Math.max(1, cssSize);

  const frozenTime = frozenAt ?? POSES[stateId];
  const defaultLook = () => followLook(0, 0, baseYaw, basePitch);
  const stillFrame = (bot: BotEngine, at: number) => {
    // Grok rests on its 2.5D gaze; Bloub's own palette keeps the expression's own gaze (for the pixel suite).
    if (palette !== "grok") return bot.sample(at);
    bot.setLook(defaultLook(), at - 0.02, 0.001);
    return bot.sample(at);
  };
  const [frame, setFrame] = useState<BotFrame>(() => engine.current!.sample(frozenTime));
  const lastDraw = useRef(0);
  const blinkOff = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useId().replace(/[:]/g, "");
  const clipId = `bloub-clip-${uid}`;

  // A new shape morphs (BloubBot.vue:408); a still frame redraws at once.
  useEffect(() => {
    const bot = engine.current!;
    bot.setShape(shapes, live ? clock : 0);
    if (!live) setFrame(stillFrame(bot, POSES[stateId]));
  }, [shape, live, stateId]);

  useEffect(() => {
    const bot = engine.current!;
    bot.setExpression(expr, live ? clock : 0);
    if (!live) setFrame(stillFrame(bot, POSES[stateId]));
  }, [expression, live, stateId]);

  useEffect(() => {
    const bot = engine.current!;
    if (!live) {
      if (queueTimer.current) { clearTimeout(queueTimer.current); queueTimer.current = null; }
      pendingState.current = null;
      lastSwitch.current = -BLOUB_MIN_BLOCK;
      if (bot.state !== stateId) bot.setState(stateId, 0);
      aiming.current = false;
      setFrame(stillFrame(bot, POSES[stateId]));
      return;
    }
    // A switch inside MIN_BLOCK waits for the running block, so the morph finishes (Bloub's cycles.ts).
    const apply = (id: string, at: number) => { bot.setState(id as StateId, at); lastSwitch.current = at; };
    const delay = stateSwitchDelay(clock, lastSwitch.current);
    if (delay === 0) {
      apply(stateId, clock);
      return;
    }
    pendingState.current = stateId;
    if (queueTimer.current) clearTimeout(queueTimer.current);
    queueTimer.current = setTimeout(() => {
      const id = pendingState.current ?? stateId;
      pendingState.current = null;
      apply(id, clock);
    }, Math.max(10, delay * 1000));
    return () => { if (queueTimer.current) { clearTimeout(queueTimer.current); queueTimer.current = null; } };
  }, [stateId, live]);

  // The animation: the hovered avatar runs every frame; a background state at the list rate.
  useEffect(() => {
    if (!live) return;
    const bot = engine.current!;
    const step = 1 / fps;
    const baseFace = Boolean(STATE_BY_ID.get(stateId)?.baseFace);
    return subscribeFrames((now) => {
      if (now - lastDraw.current < step - 0.0005) return;
      const dt = Math.min(Math.max(now - lastDraw.current, 0.001), 0.064);
      lastDraw.current = now;

      // The whole body leans and drifts toward the pointer, on Bloub's spring.
      const aim = hovering ? pointer.current : null;
      const lean = canLean && aim;
      const targetX = lean ? Math.max(-DRIFT_PX, Math.min(DRIFT_PX, aim!.nx * DRIFT_PX)) * unitsPerPx : 0;
      const targetY = lean ? Math.max(-DRIFT_PX, Math.min(DRIFT_PX, aim!.ny * DRIFT_PX)) * unitsPerPx : 0;
      const targetLean = lean ? aim!.nx * LEAN_DEG : 0;
      let s = spring.current;
      const k = hovering ? CHASE_K : HOME_K;
      const c = hovering ? CHASE_C : HOME_C;
      [s.x, s.vx] = stepSpring(s.x, s.vx, targetX, dt, k, c);
      [s.y, s.vy] = stepSpring(s.y, s.vy, targetY, dt, k, c);
      [s.lean, s.vLean] = stepSpring(s.lean, s.vLean, targetLean, dt, k, c);
      if (!hovering && Math.abs(s.x) < 0.02 && Math.abs(s.y) < 0.02 && Math.abs(s.lean) < 0.02
        && Math.abs(s.vx) < 0.02 && Math.abs(s.vy) < 0.02 && Math.abs(s.vLean) < 0.02) {
        s.x = 0; s.y = 0; s.lean = 0; s.vx = 0; s.vy = 0; s.vLean = 0;
        setSettling(false);
      }

      // Bloub's own head turn: the eyes ride the sphere (yaw/pitch), not a flat shift.
      if (aim && baseFace) {
        // One easing only: the engine's morph is near-instant, the spring does the smoothing.
        bot.setLook(followLook(aim.nx, aim.ny, baseYaw, basePitch), now, 0.001);
        aiming.current = true;
      } else if (aiming.current) {
        // Come home to the 2.5D look (Grok) or a flat front face (Bloub's own palette).
        bot.setLook(palette === "grok" ? defaultLook() : null, now, palette === "grok" ? 0.2 : TURN_TIME);
        aiming.current = false;
      }
      setFrame(bot.sample(now));
    });
  }, [live, fps, stateId, hovering, settling, unitsPerPx, canLean]);

  // A still avatar blinks now and then, without running the morphs.
  useEffect(() => {
    if (live || frozenAt !== undefined || reduced) return;
    const bot = engine.current!;
    const settled = POSES[stateId];
    const shut = closedEyeTime(settled + 0.5);
    setFrame(stillFrame(bot, settled));
    const timer = setInterval(() => {
      setFrame(bot.sample(shut));
      blinkOff.current = setTimeout(() => setFrame(bot.sample(settled)), 120);
    }, 4200);
    return () => {
      clearInterval(timer);
      if (blinkOff.current) clearTimeout(blinkOff.current);
      blinkOff.current = null;
    };
  }, [live, frozenAt, reduced, stateId]);

  useImperativeHandle(ref, () => ({
    blink: () => {
      const bot = engine.current!;
      if (!live) {
        setFrame(bot.sample(closedEyeTime(frozenTime + 0.5)));
        blinkOff.current = setTimeout(() => setFrame(bot.sample(frozenTime)), 120);
        return;
      }
      bot.setState("wink", clock);
      setTimeout(() => bot.setState(stateId, clock), 420);
    },
    spin: (durationMs = 700) => {
      const bot = engine.current!;
      bot.setState("swirl", clock);
      setTimeout(() => bot.setState(stateId, clock), durationMs);
    },
    setExpression: () => {},
  }), [stateId, live, frozenTime]);

  // The whole tile is the target (the row, the header pill), not just the drawn face.
  useEffect(() => {
    const element = hitRef?.current ?? svgRef.current;
    if (!element || typeof window === "undefined") return;
    const measure = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      if (pointerEvent.pointerType === "touch") return;
      const box = element.getBoundingClientRect();
      if (box.width === 0) return;
      pointer.current = {
        nx: Math.max(-1, Math.min(1, (pointerEvent.clientX - (box.left + box.width / 2)) / (box.width / 2))),
        ny: Math.max(-1, Math.min(1, (pointerEvent.clientY - (box.top + box.height / 2)) / (box.height / 2))),
      };
    };
    const enter = () => setHovering(true);
    const leave = () => { pointer.current = null; setHovering(false); setSettling(canAnimate); };
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointermove", measure);
    element.addEventListener("pointerleave", leave);
    return () => {
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointermove", measure);
      element.removeEventListener("pointerleave", leave);
    };
  }, [hitRef, canAnimate]);

  const s = spring.current;
  const transform = `translate(${s.x.toFixed(2)} ${s.y.toFixed(2)}) rotate(${s.lean.toFixed(2)})`;
  const vb = half;

  return (
    <svg
      ref={svgRef}
      width={cssSize * 2}
      height={cssSize * 2}
      viewBox={`${-vb} ${-vb} ${vb * 2} ${vb * 2}`}
      role="img"
      aria-label={label}
      data-bloub-state={stateId}
      data-bloub-expression={expression}
      style={{ width: cssSize, height: cssSize, overflow: "visible", shapeRendering: "geometricPrecision" }}
    >
      <defs>
        {/* Clip, not a mask with a light under-layer: nothing light is ever painted outside the eyes. */}
        <clipPath id={clipId}>
          <path d={frame.bodyPath} />
        </clipPath>
        {frame.arcs.map((arc) => (
          <linearGradient
            key={arc.id}
            id={`${uid}-${arc.id}`}
            gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1}
            y1={arc.grad.y1}
            x2={arc.grad.x2}
            y2={arc.grad.y2}
          >
            {arc.grad.stops.map((stop, index) => (
              <stop key={index} offset={index / Math.max(1, arc.grad.stops.length - 1)} stopColor={stop} />
            ))}
          </linearGradient>
        ))}
      </defs>

      <g transform={transform}>
        <g fill="none" strokeLinecap="round">
          {frame.arcs.map((arc) => (
            <path key={`b${arc.id}`} d={arc.back} stroke={`url(#${uid}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity} />
          ))}
        </g>

        {frame.dotsBehind && (
          <g>
            {frame.dots.map((dot, index) => dot.d ? (
              <path key={`pb${index}`} d={dot.d} transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${RAYON})`} opacity={dot.opacity} {...dotFill(dot, ink, surface)} />
            ) : (
              <circle key={`pb${index}`} cx={dot.x} cy={dot.y} r={dot.r} opacity={dot.opacity} {...dotFill(dot, ink, surface)} />
            ))}
          </g>
        )}

        <g opacity={frame.bodyAlpha} clipPath={`url(#${clipId})`}>
          <rect x={-vb} y={-vb} width={vb * 2} height={vb * 2} fill={ink} />
          {frame.eyes.map((eye, index) => (
            <path key={`e${index}`} d={eye.d} transform={eye.matrix} opacity={eye.alpha} fill={eyeFill ?? surface} />
          ))}
          {frame.notch && <circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill={surface} />}
        </g>
        {outlineColor && <path d={frame.bodyPath} fill="none" stroke={outlineColor} strokeWidth={1.5} />}

        {!frame.dotsBehind && (
          <g>
            {frame.dots.map((dot, index) => dot.d ? (
              <path key={`pf${index}`} d={dot.d} transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${RAYON})`} opacity={dot.opacity} {...dotFill(dot, ink, surface)} />
            ) : (
              <circle key={`pf${index}`} cx={dot.x} cy={dot.y} r={dot.r} opacity={dot.opacity} {...dotFill(dot, ink, surface)} />
            ))}
          </g>
        )}

        {frame.notif && <circle cx={frame.notif.x} cy={frame.notif.y} r={frame.notif.r} fill={NOTIF_BLUE} />}

        <g fill="none" strokeLinecap="round">
          {frame.arcs.map((arc) => (
            <path key={`f${arc.id}`} d={arc.front} stroke={`url(#${uid}-${arc.id})`} strokeWidth={arc.width} opacity={arc.opacity} />
          ))}
        </g>
      </g>
    </svg>
  );
});
