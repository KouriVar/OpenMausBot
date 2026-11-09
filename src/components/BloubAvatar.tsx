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

/** Below this an avatar is a still frame with the odd blink: the morphs would be invisible anyway. */
export const BLOUB_STILL_SIZE = 40;

/** One large avatar (the profile card) gets the full frame rate; the rest of a list is throttled. */
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
};

/* ------------------------------------------------------------ one clock */

const frameListeners = new Set<(clock: number) => void>();
let clock = 0;
let raf = 0;
let last = 0;

function tick(now: number) {
  // A hidden tab resumes without jumping forward: rAF is suspended while hidden.
  const dt = last ? Math.min((now - last) / 1000, 0.064) : 0;
  last = now;
  clock += dt;
  for (const listener of frameListeners) listener(clock);
  raf = requestAnimationFrame(tick);
}

/** One requestAnimationFrame for every Bloub avatar on the page. */
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

/** The page's surface colour, as a hex, so the eye holes and the particles' depth read right. */
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

/** `mixHex` reads hex only; a CSS variable that reached it must not produce `NaN`. */
function safeMix(from: string, to: string, t: number): string {
  try {
    const out = mixHex(from, to, t);
    return /^#[0-9a-f]{6}$/i.test(out) ? out : to;
  } catch {
    return to;
  }
}

/** A time in `[from, from + span]` where Bloub's eyes are shut. */
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
  },
  ref,
) {
  const reduced = useReducedMotion();
  const stateId = bloubState(state);
  const still = frozenAt !== undefined || !animated || reduced || size < BLOUB_STILL_SIZE;
  const shapes = SHAPE_BY_ID.get(shape)?.radii ?? null;
  const expr = EXPRESSION_BY_ID.get(expression) ?? null;
  const ink = COLOR_BY_ID.get(colorId)?.hex ?? "#0a0a0c";
  const surface = usePaper(paper);

  const engine = useRef<BotEngine | null>(null);
  if (!engine.current) engine.current = new BotEngine(RAYON, stateId, shapes, expr);

  const frozenTime = frozenAt ?? POSES[stateId];
  const [frame, setFrame] = useState<BotFrame>(() => engine.current!.sample(frozenTime));
  const lastDraw = useRef(0);
  const blinkOff = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useId().replace(/[:]/g, "");
  const maskId = `bloub-mask-${uid}`;

  // A new shape morphs, dated now (BloubBot.vue:408).
  useEffect(() => {
    const bot = engine.current!;
    bot.setShape(shapes, still ? 0 : clock);
    if (still) setFrame(bot.sample(frozenTime));
  }, [shape, still, frozenTime]);

  // A new resting expression morphs too (BloubBot.vue:415).
  useEffect(() => {
    const bot = engine.current!;
    bot.setExpression(expr, still ? 0 : clock);
    if (still) setFrame(bot.sample(frozenTime));
  }, [expression, still, frozenTime]);

  // A new state: dated now, then the frame at once if we are not animating.
  useEffect(() => {
    const bot = engine.current!;
    if (!still) {
      bot.setState(stateId, clock);
      return;
    }
    if (bot.state === stateId) {
      setFrame(bot.sample(frozenTime));
      return;
    }
    bot.setState(stateId, 0);
    setFrame(bot.sample(frozenTime));
  }, [stateId, still, frozenTime]);

  // The animation: one subscription to the shared clock, throttled for a list.
  useEffect(() => {
    if (still) return;
    const bot = engine.current!;
    const fps = size >= BLOUB_SINGLE_SIZE ? SINGLE_FPS : LIST_FPS;
    const step = 1 / fps;
    return subscribeFrames((now) => {
      if (now - lastDraw.current < step - 0.0005) return;
      lastDraw.current = now;
      setFrame(bot.sample(now));
    });
  }, [still, size]);

  // A still avatar blinks now and then, without running the morphs.
  useEffect(() => {
    if (!still || frozenAt !== undefined || !animated || reduced) return;
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
  }, [still, frozenAt, animated, reduced, stateId]);

  useImperativeHandle(ref, () => ({
    blink: () => {
      const bot = engine.current!;
      if (still) {
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
  }), [stateId, still, frozenTime]);

  const vb = DEMI_VIEWBOX;
  return (
    <svg width={size} height={size} viewBox={`${-vb} ${-vb} ${vb * 2} ${vb * 2}`} role="img" aria-label={label}>
      <defs>
        {/* Eyes are real holes in the body, so they stay clipped by the silhouette. */}
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
        {/* The surface colour behind the holes, so the arcs drawn behind the body stay hidden. */}
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
