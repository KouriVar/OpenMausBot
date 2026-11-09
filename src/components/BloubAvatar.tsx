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
  // A Bloub id passed straight through is already one.
  if (STATE_BY_ID.has(mausState as StateId)) return mausState as StateId;
  return STATE_BY_MAUS[mausState] || "idle";
}

/** Below this an avatar is a still frame with the odd blink, unless the pointer comes near. */
export const BLOUB_STILL_SIZE = 40;
/** Small avatars crop to the body so the face fills the tile; from here up the rings have room. */
const BLOUB_CROP_BELOW = 48;
/** How close the pointer wakes a still avatar. */
export const BLOUB_NEAR_PX = 120;
/** A lone large avatar gets the full frame rate; the rest of a list is throttled. */
export const BLOUB_SINGLE_SIZE = 96;
const LIST_FPS = 30;
const SINGLE_FPS = 60;

export type BloubAvatarHandle = {
  blink: () => void;
  spin: (durationMs?: number) => void;
  setExpression: (index: number) => void;
};

export type BloubAvatarProps = {
  size?: number;
  /** A Bloub shape id (`cercle`, `galet`, …). */
  shape?: string;
  /** A Bloub colour id (`encre`, `vert`, …). */
  colorId?: string;
  /** A Bloub resting expression id (`neutre`, …). */
  expression?: string;
  state?: string;
  animated?: boolean;
  /** Renders this instant instead of a clock: one reproducible picture. */
  frozenAt?: number;
  /** The surface behind the eye holes; falls back to the page's own colour. */
  paper?: string;
  label?: string;
  /** How far past its box the pointer wakes and turns the avatar, as a multiple of `size`. */
  followScale?: number;
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

/* ----------------------------------------------------------- one pointer */

let pointer: { x: number; y: number } | null = null;
type Measurer = () => { dist: number; range: number };
const measurers = new Map<string, Measurer>();
const ownerSubs = new Set<(owner: string | null) => void>();
let owner: string | null = null;
let pointerBound = false;

/** Only the avatar closest to the pointer (within its own range) follows; the rest rest. */
function computeOwner() {
  let best: string | null = null;
  let bestRatio = Infinity;
  if (pointer) {
    for (const [id, measure] of measurers) {
      const box = measure();
      if (!box || box.dist > box.range) continue;
      const ratio = box.dist / Math.max(1, box.range);
      if (ratio < bestRatio) { bestRatio = ratio; best = id; }
    }
  }
  if (best !== owner) {
    owner = best;
    for (const sub of ownerSubs) sub(owner);
  }
}

function ensurePointer() {
  if (pointerBound || typeof window === "undefined") return;
  pointerBound = true;
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    pointer = { x: event.clientX, y: event.clientY };
    computeOwner();
  }, { passive: true });
  document.addEventListener("pointerleave", () => { pointer = null; computeOwner(); });
}

/** One pointermove for the whole page; each avatar registers how far the pointer is, and one owner follows. */
function subscribeFollow(id: string, measure: Measurer, onChange: (owner: string | null) => void): () => void {
  ensurePointer();
  measurers.set(id, measure);
  ownerSubs.add(onChange);
  computeOwner();
  return () => {
    measurers.delete(id);
    ownerSubs.delete(onChange);
    computeOwner();
  };
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
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

function resolvePaper(given: string | undefined): string {
  if (given && /^#[0-9a-f]{3,8}$/i.test(given)) return given;
  if (typeof document !== "undefined") {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--color-panel").trim();
    if (/^#[0-9a-f]{3,8}$/i.test(value)) return value;
  }
  return "#f9f9f9";
}

function usePaper(given: string | undefined): string {
  const [paper, setPaper] = useState(() => resolvePaper(given));
  useEffect(() => {
    setPaper(resolvePaper(given));
    if (given || typeof document === "undefined") return;
    const observer = new MutationObserver(() => setPaper(resolvePaper(given)));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    return () => observer.disconnect();
  }, [given]);
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
    followScale = 1,
  },
  ref,
) {
  const reduced = useReducedMotion();
  const stateId = bloubState(state);
  const shapes = SHAPE_BY_ID.get(shape)?.radii ?? null;
  const expr = EXPRESSION_BY_ID.get(expression) ?? null;
  const ink = COLOR_BY_ID.get(colorId)?.hex ?? "#0a0a0c";
  const surface = usePaper(paper);

  const engine = useRef<BotEngine | null>(null);
  if (!engine.current) engine.current = new BotEngine(RAYON, stateId, shapes, expr);

  const [following, setFollowing] = useState(false);
  const [hover, setHover] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const aimId = useId();
  const aiming = useRef(false);

  const activeState = stateId !== "idle";
  const canAnimate = frozenAt === undefined && !reduced;
  // Small and idle: still, until the pointer comes near or a real state plays.
  // The pointer wakes even an idle avatar the caller marked not-animated; a real state playing runs live.
  const live = canAnimate && (following || hover || (animated && (size >= BLOUB_STILL_SIZE || activeState)));
  const half = size < BLOUB_CROP_BELOW ? RAYON : DEMI_VIEWBOX;

  const frozenTime = frozenAt ?? POSES[stateId];
  const [frame, setFrame] = useState<BotFrame>(() => engine.current!.sample(frozenTime));
  const lastDraw = useRef(0);
  const blinkOff = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useId().replace(/[:]/g, "");
  const maskId = `bloub-mask-${uid}`;

  // This avatar measures its own distance; only the closest one (within its range) follows.
  useEffect(() => subscribeFollow(aimId, () => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!pointer || !box || box.width === 0) return { dist: Infinity, range: 1 };
    const dx = Math.max(box.left - pointer.x, 0, pointer.x - box.right);
    const dy = Math.max(box.top - pointer.y, 0, pointer.y - box.bottom);
    return { dist: Math.hypot(dx, dy), range: size * followScale };
  }, (next) => setFollowing(next === aimId)), [aimId, size, followScale]);

  // A new shape morphs (BloubBot.vue:408); still frames redraw at once.
  useEffect(() => {
    const bot = engine.current!;
    bot.setShape(shapes, live ? clock : 0);
    if (!live) setFrame(bot.sample(POSES[stateId]));
  }, [shape, live, stateId]);

  // A new resting expression morphs too (BloubBot.vue:415).
  useEffect(() => {
    const bot = engine.current!;
    bot.setExpression(expr, live ? clock : 0);
    if (!live) setFrame(bot.sample(POSES[stateId]));
  }, [expression, live, stateId]);

  // A new state is dated now; a still frame draws its settled pose at once.
  useEffect(() => {
    const bot = engine.current!;
    if (live) { bot.setState(stateId, clock); return; }
    if (bot.state !== stateId) bot.setState(stateId, 0);
    bot.setLook(null, POSES[stateId] - TURN_TIME - 0.01, TURN_TIME);
    aiming.current = false;
    setFrame(bot.sample(POSES[stateId]));
  }, [stateId, live]);

  // The animation, with Bloub's gaze on top; one shared clock, throttled for a list.
  useEffect(() => {
    if (!live) return;
    const bot = engine.current!;
    const fps = size >= BLOUB_SINGLE_SIZE ? SINGLE_FPS : LIST_FPS;
    const step = 1 / fps;
    const baseFace = Boolean(STATE_BY_ID.get(stateId)?.baseFace);
    return subscribeFrames((now) => {
      if (now - lastDraw.current < step - 0.0005) return;
      lastDraw.current = now;
      const box = svgRef.current?.getBoundingClientRect();
      if (following && pointer && box && box.width > 0 && baseFace) {
        const nx = clamp((pointer.x - (box.left + box.width / 2)) / Math.max(1, window.innerWidth / 2), -1, 1);
        const ny = clamp((pointer.y - (box.top + box.height / 2)) / Math.max(1, window.innerHeight / 2), -1, 1);
        bot.setLook(lookTarget({ nx, ny, tour: 1, pointer: true }), now);
        aiming.current = true;
      } else if (aiming.current) {
        bot.setLook(null, now, TURN_TIME);
        aiming.current = false;
      }
      setFrame(bot.sample(now));
    });
  }, [live, size, stateId, following]);

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

  const vb = half;
  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`${-vb} ${-vb} ${vb * 2} ${vb * 2}`}
      role="img"
      aria-label={label}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
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
    </svg>
  );
});
