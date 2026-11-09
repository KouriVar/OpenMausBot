import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { NOTIF_BLUE, type DotRender } from "@/vendor/bloub/decor";
import { BotEngine, type BotFrame } from "@/vendor/bloub/engine";
import { liveliness } from "@/vendor/bloub/face";
import { DEMI_VIEWBOX, RAYON } from "@/vendor/bloub/repere";
import { POSES, type StateId } from "@/vendor/bloub/states";

/** The OMB states Bloub has a pose of its own for; anything else rests. */
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
  return (mausState && STATE_BY_MAUS[mausState]) || "idle";
}

/** Below this, an avatar is a still frame with the odd blink: the morphs are invisible anyway. */
export const BLOUB_STILL_SIZE = 28;

export type BloubAvatarHandle = {
  blink: () => void;
  spin: (durationMs?: number) => void;
  setExpression: (index: number) => void;
};

export type BloubAvatarProps = {
  size?: number;
  /** A hex from `MAUS_COLORS`. */
  color: string;
  state?: string;
  animated?: boolean;
  /** Renders this instant instead of a clock: one reproducible picture. */
  frozenAt?: number;
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
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setReduced(query.matches);
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

/** A time in `[from, from + span]` where Bloub's eyes are shut. */
function closedEyeTime(from: number, span = 6): number {
  let best = from;
  let low = 1;
  for (let step = 0; step <= span * 30; step += 1) {
    const at = from + step / 30;
    const lid = liveliness(at, { blink: true }).lid;
    if (lid < low) {
      low = lid;
      best = at;
    }
  }
  return best;
}

function dotColor(dot: DotRender, ink: string): { fill: string; fillOpacity?: number } {
  if (dot.color) return { fill: dot.color };
  return dot.depth === undefined ? { fill: ink } : { fill: ink, fillOpacity: dot.depth };
}

export const BloubAvatar = forwardRef<BloubAvatarHandle, BloubAvatarProps>(function BloubAvatar(
  { size = 44, color, state, animated = true, frozenAt, label },
  ref,
) {
  const reduced = useReducedMotion();
  const stateId = bloubState(state);
  const still = frozenAt !== undefined || !animated || reduced || size < BLOUB_STILL_SIZE;
  const engine = useRef<BotEngine | null>(null);
  if (!engine.current) engine.current = new BotEngine(RAYON, stateId, null, null);
  const maskId = `bloub-mask-${useId().replace(/[:]/g, "")}`;
  const uid = useId().replace(/[:]/g, "");
  const [frame, setFrame] = useState<BotFrame>(() => engine.current!.sample(frozenAt ?? POSES[stateId]));
  const drawnAt = useRef(frozenAt ?? POSES[stateId]);
  const blinkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkOff = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new state: the engine morphs from the pose it is holding, dated now.
  useEffect(() => {
    const bot = engine.current!;
    if (still) {
      drawnAt.current += 10;
      bot.setState(stateId, 0);
      setFrame(bot.sample(POSES[stateId]));
      return;
    }
    bot.setState(stateId, clock);
  }, [stateId, still]);

  // The animation: one subscription to the shared clock, sampling this engine.
  useEffect(() => {
    if (still) return;
    const bot = engine.current!;
    return subscribeFrames((now) => setFrame(bot.sample(now)));
  }, [still]);

  // A still avatar blinks now and then, without running the morphs.
  useEffect(() => {
    if (!still || frozenAt !== undefined || !animated || reduced) return;
    const bot = engine.current!;
    const settled = POSES[stateId];
    const shut = closedEyeTime(settled + 0.5);
    setFrame(bot.sample(settled));
    blinkTimer.current = setInterval(() => {
      setFrame(bot.sample(shut));
      blinkOff.current = setTimeout(() => setFrame(bot.sample(settled)), 120);
    }, 4200);
    return () => {
      if (blinkTimer.current) clearInterval(blinkTimer.current);
      if (blinkOff.current) clearTimeout(blinkOff.current);
      blinkTimer.current = null;
      blinkOff.current = null;
    };
  }, [still, frozenAt, animated, reduced, stateId]);

  useImperativeHandle(ref, () => ({
    blink: () => {
      const bot = engine.current!;
      if (still) {
        setFrame(bot.sample(closedEyeTime(drawnAt.current + 0.5)));
        blinkOff.current = setTimeout(() => setFrame(bot.sample(drawnAt.current)), 120);
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
  }), [stateId, still]);

  const ink = color;
  const paper: CSSProperties = { fill: "var(--color-panel)" };
  const vb = DEMI_VIEWBOX;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-vb} ${-vb} ${vb * 2} ${vb * 2}`}
      role="img"
      aria-label={label}
      style={{ color: "var(--color-panel)" }}
    >
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
            <path key={`pb${index}`} d={dot.d} transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${RAYON})`} opacity={dot.opacity} {...dotColor(dot, ink)} />
          ) : (
            <circle key={`pb${index}`} cx={dot.x} cy={dot.y} r={dot.r} opacity={dot.opacity} {...dotColor(dot, ink)} />
          ))}
        </g>
      )}

      <g opacity={frame.bodyAlpha}>
        {/* The page's colour behind the holes, so the arcs behind the body stay hidden. */}
        <path d={frame.bodyPath} style={paper} />
        <g mask={`url(#${maskId})`}>
          <rect x={-vb} y={-vb} width={vb * 2} height={vb * 2} fill={ink} />
        </g>
      </g>

      {!frame.dotsBehind && (
        <g>
          {frame.dots.map((dot, index) => dot.d ? (
            <path key={`pf${index}`} d={dot.d} transform={`translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${RAYON})`} opacity={dot.opacity} {...dotColor(dot, ink)} />
          ) : (
            <circle key={`pf${index}`} cx={dot.x} cy={dot.y} r={dot.r} opacity={dot.opacity} {...dotColor(dot, ink)} />
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
