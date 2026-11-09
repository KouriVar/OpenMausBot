import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { NOTIF_BLUE, type DotRender } from "@/vendor/bloub/decor";
import { BotEngine, type BotFrame } from "@/vendor/bloub/engine";
import { DEFAULT_EXPRESSION, EXPRESSION_BY_ID, type BotExpression } from "@/vendor/bloub/expressions";
import { liveliness } from "@/vendor/bloub/face";
import { DEMI_VIEWBOX, RAYON } from "@/vendor/bloub/repere";
import { DEFAULT_COLOR, DEFAULT_SHAPE, mixHex } from "@/vendor/bloub/skins";
import { POSES, STATE_BY_ID, type StateId } from "@/vendor/bloub/states";
import { useColorScheme, type ColorScheme } from "@/lib/color-scheme";
import {
  REST_LOOK,
  REST_PITCH,
  REST_ROLL,
  REST_YAW,
  approach,
  bloubShapeKind,
  followTarget,
} from "@/fork/bloub-gaze";
import {
  bloubColorHex,
  bloubEyeColor,
  bloubEyeMode,
  bloubGradient,
  bloubSolid,
  normalizeBloubColor,
} from "@/fork/bloub-skin";
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

const FPS = 60;
const POKE_ORDER = ["spin", "bounce", "nod"] as const;
type PokeKind = (typeof POKE_ORDER)[number];
const POKE_DURATION: Record<PokeKind, number> = { spin: 0.9, bounce: 0.62, nod: 0.5 };

export type BloubAvatarHandle = {
  blink: () => void;
  spin: (durationMs?: number) => void;
  setExpression: (index: number) => void;
  poke?: () => void;
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
  /** The surface behind the eye holes for Bloub's own palette; Grok's eyes are real cutouts. */
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
  /** Pin the light/dark scheme instead of reading it from the app skin. */
  theme?: ColorScheme;
  /** Let a click on the face cycle spin/bounce/nod. */
  pokable?: boolean;
};

/* ------------------------------------------------------------ one clock */

const frameListeners = new Set<(clock: number) => void>();
let clock = 0;
let raf = 0;
let last = 0;

function tick(now: number) {
  const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
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

/** Relative luminance of a #rgb/#rrggbb, so Bloub's paper eye holes can be tinted against the ink. */
function luminance(hex: string): number {
  const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const value = Number.parseInt(full.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

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

/** Zero the expression's own roll so the whole-head roll can be applied on the group instead (Grok's
 * roll tilts body and eyes together, it is not a separate eye tilt). */
function zeroRoll(e: BotExpression | null): BotExpression | null {
  return e ? { ...e, gaze: { ...e.gaze, roll: 0 } } : null;
}

/* ------------------------------------------------- shared static-frame cache */
/** Small, resting Grok faces share one sampled frame per shape:colour:theme (never ticking). */
const idleFrameCache = new Map<string, BotFrame>();
function sharedIdleFrame(shape: string, radii: number[], color: string, scheme: ColorScheme, expr: BotExpression | null): BotFrame {
  const key = `${shape}|${color}|${scheme}|${expr?.id ?? ""}`;
  const hit = idleFrameCache.get(key);
  if (hit) return hit;
  const bot = new BotEngine(RAYON, "idle", radii, expr);
  bot.setLook(REST_LOOK, POSES.idle - 0.02, 0.001);
  const frame = bot.sample(POSES.idle);
  if (idleFrameCache.size > 256) idleFrameCache.clear();
  idleFrameCache.set(key, frame);
  return frame;
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
    theme,
    pokable = false,
  },
  ref,
) {
  const reduced = useReducedMotion();
  const autoScheme = useColorScheme();
  const scheme: ColorScheme = theme ?? autoScheme;
  const stateId = bloubState(state);
  const shapes = bloubShapeRadii(shape);
  const rawExpr = EXPRESSION_BY_ID.get(expression) ?? null;
  // The app leaves `palette` unset, which IS Grok; only the comparison suite passes "bloub".
  const grok = palette !== "bloub";
  const color = normalizeBloubColor(colorId);
  const ink = grok ? bloubSolid(color, scheme) : bloubColorHex(colorId, "bloub");
  const eyeMode = bloubEyeMode(palette);
  const surface = usePaper(paper, ink);
  const kind = bloubShapeKind(shape);

  const baseExpr = useMemo(() => (grok ? zeroRoll(rawExpr) : rawExpr), [rawExpr, grok]);
  const hoverExpr = useMemo(() => zeroRoll(EXPRESSION_BY_ID.get("surpris") ?? null), []);

  const engine = useRef<BotEngine | null>(null);
  if (!engine.current) engine.current = new BotEngine(RAYON, stateId, shapes, baseExpr);

  const [hovering, setHovering] = useState(false);
  const [settling, setSettling] = useState(false);
  const [pokeActive, setPokeActive] = useState(false);
  const [inView, setInView] = useState(true);
  const [docHidden, setDocHidden] = useState(typeof document !== "undefined" ? document.hidden : false);

  const svgRef = useRef<SVGSVGElement>(null);
  const pointer = useRef<{ nx: number; ny: number } | null>(null); // screen sense: nx right+, ny down+
  const follow = useRef({ yaw: REST_YAW, pitch: REST_PITCH, px: 0, py: 0, hold: 0 });
  const view = useRef({ tx: 0, ty: 0, roll: grok ? REST_ROLL : 0, sx: 1, sy: 1 });
  const poke = useRef<{ kind: PokeKind; start: number; dur: number; turns: number } | null>(null);
  const pokeCount = useRef(0);
  const lastSwitch = useRef(-BLOUB_MIN_BLOCK);
  const pendingState = useRef<string | null>(null);
  const queueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDraw = useRef(0);
  const blinkOff = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeState = stateId !== "idle";
  const baseFace = Boolean(STATE_BY_ID.get(stateId)?.baseFace);
  const canAnimate = frozenAt === undefined && !reduced;
  const live = canAnimate && inView && !docHidden && (hovering || settling || pokeActive || (animated && activeState));

  const cssSize = fitBody ? (frameSize ?? size) : size;
  const half = fitBody ? (RAYON * cssSize) / Math.max(1, size) : size < 48 ? RAYON : DEMI_VIEWBOX;
  const vb = half;

  const frozenTime = frozenAt ?? POSES[stateId];
  // The expression the engine should hold: surprised while merely hovering a resting face.
  const renderExpr = grok && hovering && stateId === "idle" && baseFace ? hoverExpr ?? baseExpr : baseExpr;

  const stillFrame = (bot: BotEngine, at: number) => {
    if (grok) bot.setLook(REST_LOOK, at - 0.02, 0.001);
    else bot.setLook(null, at, 0.001);
    return bot.sample(at);
  };

  const staticFrame = (): BotFrame => {
    const bot = engine.current!;
    if (grok) {
      if (frozenAt !== undefined) {
        bot.setLook(REST_LOOK, frozenAt - 0.02, 0.001);
        return bot.sample(frozenAt);
      }
      if (!activeState && size < 48) return sharedIdleFrame(shape, shapes ?? [], color, scheme, renderExpr);
      return stillFrame(bot, POSES[stateId]);
    }
    // Bloub's own palette: always the pose's own instant — byte-for-byte what the pixel suite renders.
    bot.setLook(null, POSES[stateId], 0.001);
    return bot.sample(POSES[stateId]);
  };

  const [frame, setFrame] = useState<BotFrame>(() => {
    const bot = engine.current!;
    if (grok) bot.setLook(REST_LOOK, frozenTime - 0.02, 0.001);
    return bot.sample(frozenTime);
  });
  const uid = useId().replace(/[:]/g, "");
  const clipId = `bloub-clip-${uid}`;
  const maskId = `bloub-mask-${uid}`;
  const gradId = `bloub-grad-${uid}`;
  const grad = grok ? bloubGradient(color, scheme) : null;

  // Shape / expression / state, applied to the engine while live; a still frame redraws at once.
  useEffect(() => {
    const bot = engine.current!;
    bot.setShape(shapes, live ? clock : 0);
    if (!live) setFrame(staticFrame());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, live, stateId]);

  useEffect(() => {
    const bot = engine.current!;
    bot.setExpression(renderExpr, live ? clock : 0);
    if (!live) setFrame(staticFrame());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderExpr, live, stateId]);

  useEffect(() => {
    const bot = engine.current!;
    if (!live) {
      if (queueTimer.current) { clearTimeout(queueTimer.current); queueTimer.current = null; }
      pendingState.current = null;
      lastSwitch.current = -BLOUB_MIN_BLOCK;
      if (bot.state !== stateId) bot.setState(stateId, 0);
      setFrame(staticFrame());
      return;
    }
    const apply = (id: string, at: number) => { bot.setState(id as StateId, at); lastSwitch.current = at; };
    const delay = stateSwitchDelay(clock, lastSwitch.current);
    if (delay === 0) { apply(stateId, clock); return; }
    pendingState.current = stateId;
    if (queueTimer.current) clearTimeout(queueTimer.current);
    queueTimer.current = setTimeout(() => {
      const id = pendingState.current ?? stateId;
      pendingState.current = null;
      apply(id, clock);
    }, Math.max(10, delay * 1000));
    return () => { if (queueTimer.current) { clearTimeout(queueTimer.current); queueTimer.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId, live]);

  // The frame loop: exponential follow + poke, no spring, settles to a still frame.
  useEffect(() => {
    if (!live) return;
    const bot = engine.current!;
    const step = 1 / FPS;
    let firstFrame = true;
    return subscribeFrames((now) => {
      if (now - lastDraw.current < step - 0.0005) return;
      const dt = firstFrame ? 1 / FPS : Math.min(Math.max(now - lastDraw.current, 0.0001), 0.1);
      firstFrame = false;
      lastDraw.current = now;

      const st = follow.current;
      const aim = hovering ? pointer.current : null;
      if (aim) {
        const t = followTarget(kind, aim.nx, -aim.ny);
        st.yaw = approach(st.yaw, t.yaw, dt);
        st.pitch = approach(st.pitch, t.pitch, dt);
        st.px = approach(st.px, t.px, dt);
        st.py = approach(st.py, t.py, dt);
      }
      // The hold factor snaps a hair early (0.02 ≈ 1.5°) so a released face is back to rest within 0.5 s.
      st.hold = approach(st.hold, aim ? 1 : 0, dt, 0.02);
      const h = st.hold;

      let yaw = REST_YAW + (st.yaw - REST_YAW) * h;
      let pitch = REST_PITCH + (st.pitch - REST_PITCH) * h;
      let tx = st.px * h * RAYON;
      let ty = -st.py * h * RAYON;
      let sx = 1;
      let sy = 1;

      const pk = poke.current;
      if (pk) {
        const e = Math.min(1, Math.max(0, (now - pk.start) / pk.dur));
        if (pk.kind === "spin") yaw += 180 * pk.turns * (1 - Math.cos(Math.PI * e));
        else if (pk.kind === "nod") pitch += 16 * Math.sin(Math.PI * e);
        else {
          const s = Math.sin(Math.PI * e);
          ty -= 0.3 * RAYON * s;
          sx = 1 + 0.18 * s;
          sy = 1 - 0.22 * s;
        }
        if (e >= 1) { poke.current = null; setPokeActive(false); }
      }

      bot.setLook(grok ? { yaw, pitch, mix: 1, spin: 0, wander: 0 } : null, now - 0.001, grok ? 0.0001 : 0.001);
      view.current = { tx, ty, roll: grok ? REST_ROLL * (1 - h) : 0, sx, sy };
      setFrame(bot.sample(now));

      if (!hovering && !poke.current && h < 0.001 && !(animated && activeState)) {
        st.hold = 0; st.yaw = REST_YAW; st.pitch = REST_PITCH; st.px = 0; st.py = 0;
        view.current = { tx: 0, ty: 0, roll: grok ? REST_ROLL : 0, sx: 1, sy: 1 };
        setSettling(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, stateId, hovering, pokeActive, kind, grok, animated, activeState]);

  // Nothing else: a resting face is a still frame — no blinking, no idle micro-motion (quiet rules).

  const startPoke = (kindName?: PokeKind) => {
    if (reduced) return;
    const kind2 = kindName ?? POKE_ORDER[pokeCount.current % POKE_ORDER.length]!;
    pokeCount.current += 1;
    poke.current = { kind: kind2, start: clock, dur: POKE_DURATION[kind2], turns: kind2 === "spin" ? 2 : 1 };
    setPokeActive(true);
  };

  useImperativeHandle(ref, () => ({
    blink: () => {
      const bot = engine.current!;
      if (!live) {
        setFrame(bot.sample(closedEyeTime(frozenTime + 0.5)));
        blinkOff.current = setTimeout(() => setFrame(staticFrame()), 120);
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
    poke: () => startPoke(),
  }));

  // The whole tile is the hover target; the gaze is normalised against the FACE's own rect.
  useEffect(() => {
    const element = hitRef?.current ?? svgRef.current;
    if (!element || typeof window === "undefined") return;
    const measure = (event: Event) => {
      const e = event as PointerEvent;
      if (e.pointerType === "touch") return;
      const face = (svgRef.current ?? element).getBoundingClientRect();
      if (face.width === 0) return;
      pointer.current = {
        nx: Math.max(-1, Math.min(1, (e.clientX - (face.left + face.width / 2)) / (face.width * 0.5))),
        ny: Math.max(-1, Math.min(1, (e.clientY - (face.top + face.height / 2)) / (face.height * 0.5))),
      };
    };
    const enter = () => setHovering(true);
    const leave = () => { pointer.current = null; setHovering(false); setSettling(canAnimate); };
    const onBlur = () => { pointer.current = null; setHovering(false); setSettling(canAnimate); };
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointermove", measure);
    element.addEventListener("pointerleave", leave);
    window.addEventListener("blur", onBlur);
    document.addEventListener("pointerleave", onBlur);
    return () => {
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointermove", measure);
      element.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerleave", onBlur);
    };
  }, [hitRef, canAnimate]);

  // Off-screen or hidden → stop the loop (Grok's power saving).
  useEffect(() => {
    const el = svgRef.current;
    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => { for (const e of entries) setInView(e.isIntersecting); }, { rootMargin: "100px" });
      io.observe(el);
    }
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => { io?.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const v = view.current;
  const transform = (v.sx === 1 && v.sy === 1)
    ? `translate(${v.tx.toFixed(2)} ${v.ty.toFixed(2)}) rotate(${v.roll.toFixed(2)})`
    : `translate(${v.tx.toFixed(2)} ${v.ty.toFixed(2)}) rotate(${v.roll.toFixed(2)}) scale(${v.sx.toFixed(3)} ${v.sy.toFixed(3)})`;
  const eyeFill = bloubEyeColor(palette) ?? surface;
  const cutout = eyeMode === "cutout";

  const onFaceClick = (event: React.MouseEvent) => {
    if (!pokable) return;
    event.stopPropagation();
    startPoke();
  };

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
      onClick={pokable ? onFaceClick : undefined}
      style={{ width: cssSize, height: cssSize, overflow: "visible", shapeRendering: "geometricPrecision", cursor: pokable ? "pointer" : undefined }}
    >
      <defs>
        {grad && (
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={grad.from} />
            <stop offset="1" stopColor={grad.to} />
          </linearGradient>
        )}
        {cutout ? (
          <mask id={maskId} maskUnits="userSpaceOnUse" x={-vb} y={-vb} width={vb * 2} height={vb * 2}>
            <path d={frame.bodyPath} fill="#ffffff" />
            {frame.eyes.map((eye, index) => (
              <path key={`m${index}`} d={eye.d} transform={eye.matrix} opacity={eye.alpha} fill="#000000" />
            ))}
            {frame.notch && <circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill="#000000" />}
          </mask>
        ) : (
          <clipPath id={clipId}>
            <path d={frame.bodyPath} />
          </clipPath>
        )}
        {frame.arcs.map((arc) => (
          <linearGradient key={arc.id} id={`${uid}-${arc.id}`} gradientUnits="userSpaceOnUse"
            x1={arc.grad.x1} y1={arc.grad.y1} x2={arc.grad.x2} y2={arc.grad.y2}>
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

        {cutout ? (
          <rect x={-vb} y={-vb} width={vb * 2} height={vb * 2} fill={`url(#${gradId})`} mask={`url(#${maskId})`} opacity={frame.bodyAlpha} />
        ) : (
          <g opacity={frame.bodyAlpha} clipPath={`url(#${clipId})`}>
            <rect x={-vb} y={-vb} width={vb * 2} height={vb * 2} fill={ink} />
            {frame.eyes.map((eye, index) => (
              <path key={`e${index}`} d={eye.d} transform={eye.matrix} opacity={eye.alpha} fill={eyeFill} />
            ))}
            {frame.notch && <circle cx={frame.notch.x} cy={frame.notch.y} r={frame.notch.r} fill={surface} />}
          </g>
        )}
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
