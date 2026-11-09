import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { NOTIF_BLUE, type DotRender } from "@/vendor/bloub/decor";
import { BotEngine, type BotFrame } from "@/vendor/bloub/engine";
import { DEFAULT_EXPRESSION, EXPRESSION_BY_ID } from "@/vendor/bloub/expressions";
import { liveliness } from "@/vendor/bloub/face";
import { DEMI_VIEWBOX, RAYON } from "@/vendor/bloub/repere";
import { COLOR_BY_ID, DEFAULT_COLOR, DEFAULT_SHAPE, SHAPE_BY_ID, mixHex } from "@/vendor/bloub/skins";
import { POSES, STATE_BY_ID, type StateId } from "@/vendor/bloub/states";
import { TURN_TIME, lookTarget } from "@/fork/bloub-gaze";

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

/** A lone large avatar gets the full frame rate; a background state animates at the list rate. */
export const BLOUB_SINGLE_SIZE = 96;
const BACKGROUND_FPS = 30;

/** Degrees the body leans and pixels it drifts toward the pointer (Grok's own little lean). */
const LEAN_DEG = 6;
const DRIFT_PX = 2.5;
/** Bloub's spring, near critical so it settles with a small rebound. */
const SPRING_K = 170;
const SPRING_C = 18;

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
function stepSpring(position: number, velocity: number, target: number, dt: number): [number, number] {
  const acceleration = SPRING_K * (target - position) - SPRING_C * velocity;
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
  },
  ref,
) {
  const reduced = useReducedMotion();
  const stateId = bloubState(state);
  const shapes = SHAPE_BY_ID.get(shape)?.radii ?? null;
  const expr = EXPRESSION_BY_ID.get(expression) ?? null;
  const ink = COLOR_BY_ID.get(colorId)?.hex ?? "#0a0a0c";
  const surface = usePaper(paper, ink);

  const engine = useRef<BotEngine | null>(null);
  if (!engine.current) engine.current = new BotEngine(RAYON, stateId, shapes, expr);

  const [hovering, setHovering] = useState(false);
  const [settling, setSettling] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointer = useRef<{ nx: number; ny: number } | null>(null);
  const aiming = useRef(false);
  const spring = useRef({ x: 0, y: 0, vx: 0, vy: 0, lean: 0, vLean: 0 });

  const activeState = stateId !== "idle";
  const canAnimate = frozenAt === undefined && !reduced;
  const live = canAnimate && (hovering || settling || (animated && activeState));
  const fps = (hovering || settling) ? 60 : BACKGROUND_FPS;
  const cropBody = fitBody || size < 48;
  const half = cropBody ? RAYON : DEMI_VIEWBOX;
  const unitsPerPx = (half * 2) / Math.max(1, size);

  const frozenTime = frozenAt ?? POSES[stateId];
  const [frame, setFrame] = useState<BotFrame>(() => engine.current!.sample(frozenTime));
  const lastDraw = useRef(0);
  const blinkOff = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useId().replace(/[:]/g, "");
  const maskId = `bloub-mask-${uid}`;

  // A new shape morphs (BloubBot.vue:408); a still frame redraws at once.
  useEffect(() => {
    const bot = engine.current!;
    bot.setShape(shapes, live ? clock : 0);
    if (!live) setFrame(bot.sample(POSES[stateId]));
  }, [shape, live, stateId]);

  useEffect(() => {
    const bot = engine.current!;
    bot.setExpression(expr, live ? clock : 0);
    if (!live) setFrame(bot.sample(POSES[stateId]));
  }, [expression, live, stateId]);

  useEffect(() => {
    const bot = engine.current!;
    if (live) { bot.setState(stateId, clock); return; }
    if (bot.state !== stateId) bot.setState(stateId, 0);
    bot.setLook(null, POSES[stateId] - TURN_TIME - 0.01, TURN_TIME);
    aiming.current = false;
    setFrame(bot.sample(POSES[stateId]));
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
      const targetX = aim ? aim.nx * DRIFT_PX * unitsPerPx : 0;
      const targetY = aim ? aim.ny * DRIFT_PX * unitsPerPx : 0;
      const targetLean = aim ? aim.nx * LEAN_DEG : 0;
      let s = spring.current;
      [s.x, s.vx] = stepSpring(s.x, s.vx, targetX, dt);
      [s.y, s.vy] = stepSpring(s.y, s.vy, targetY, dt);
      [s.lean, s.vLean] = stepSpring(s.lean, s.vLean, targetLean, dt);
      if (!hovering && Math.abs(s.x) < 0.02 && Math.abs(s.y) < 0.02 && Math.abs(s.lean) < 0.02
        && Math.abs(s.vx) < 0.02 && Math.abs(s.vy) < 0.02 && Math.abs(s.vLean) < 0.02) {
        s.x = 0; s.y = 0; s.lean = 0; s.vx = 0; s.vy = 0; s.vLean = 0;
        setSettling(false);
      }

      // Bloub's own head turn: the eyes ride the sphere (yaw/pitch), not a flat shift.
      if (aim && baseFace) {
        bot.setLook(lookTarget({ nx: aim.nx, ny: aim.ny, tour: 1, pointer: true }), now);
        aiming.current = true;
      } else if (aiming.current) {
        bot.setLook(null, now, TURN_TIME);
        aiming.current = false;
      }
      setFrame(bot.sample(now));
    });
  }, [live, fps, stateId, hovering, settling, unitsPerPx]);

  // A still avatar blinks now and then, without running the morphs.
  useEffect(() => {
    if (live || frozenAt !== undefined || reduced) return;
    const bot = engine.current!;
    const settled = POSES[stateId];
    const shut = closedEyeTime(settled + 0.5);
    setFrame(bot.sample(settled));
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

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "touch" || reduced) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0) return;
    pointer.current = {
      nx: Math.max(-1, Math.min(1, ((event.clientX - (box.left + box.width / 2)) / (box.width / 2)))),
      ny: Math.max(-1, Math.min(1, ((event.clientY - (box.top + box.height / 2)) / (box.height / 2)))),
    };
  };

  const s = spring.current;
  const transform = `translate(${s.x.toFixed(2)} ${s.y.toFixed(2)}) rotate(${s.lean.toFixed(2)})`;
  const vb = half;

  return (
    <svg
      ref={svgRef}
      width={size * 2}
      height={size * 2}
      viewBox={`${-vb} ${-vb} ${vb * 2} ${vb * 2}`}
      role="img"
      aria-label={label}
      style={{ width: size, height: size, shapeRendering: "geometricPrecision" }}
      onPointerEnter={() => setHovering(true)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointer.current = null; setHovering(false); setSettling(canAnimate); }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-vb} y={-vb} width={vb * 2} height={vb * 2}>
          <path d={frame.bodyPath} fill="#fff" />
          {frame.eyes.map((eye, index) => (
            <path key={index} d={eye.d} transform={eye.matrix} opacity={eye.alpha} fill="#000" />
          ))}
          {frame.notch && <circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill="#000" />}
        </mask>
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

        <g opacity={frame.bodyAlpha}>
          <path d={frame.bodyPath} fill={surface} />
          <g mask={`url(#${maskId})`}>
            <rect x={-vb} y={-vb} width={vb * 2} height={vb * 2} fill={ink} />
          </g>
        </g>

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
