/** Where the bot looks: Bloub's own arrival rule (kept for the studio/morph path) plus Grok's
 * authored rest pose and pointer-follow model. Pure functions, so testable without a DOM. */

/* ---------------------------------------------------- Bloub's own arrival rule */

export const YAW_MAX = 16;
export const PITCH_MAX = 13;
export const PITCH = 10;
export const TURN = 26;
export const SPIN = 360;
export const TURN_TIME = 1.1;

export interface Aim {
  /** horizontal gap from the bot's centre, -1..1 (right positive) */
  nx: number;
  /** vertical gap, -1..1, in screen sense (down positive) */
  ny: number;
  /** how far the arrival has got, 0..1 */
  tour: number;
  /** false = no pointer known: the head stays turned, but comes alive again */
  pointer: boolean;
}

export interface Look {
  yaw: number;
  pitch: number;
  mix: number;
  spin: number;
  wander: number;
}

export function lookTarget({ nx, ny, tour, pointer }: Aim): Look {
  return {
    yaw: -TURN + nx * YAW_MAX,
    pitch: PITCH - ny * PITCH_MAX,
    mix: tour,
    spin: SPIN * (1 - tour),
    wander: pointer ? 0 : 1,
  };
}

/* ---------------------------------------------------- Grok's rest pose & follow */

/** Grok's authored resting head orientation, in degrees (from its `Da` Euler triple
 * [-18.061, 18.11, 25.643]): pitch lifts the gaze up, yaw turns it right, and roll tilts the WHOLE
 * head — body and eyes together — not the body alone. Every shape shares it. */
export const REST_PITCH = 18.06;
export const REST_YAW = 18.11;
export const REST_ROLL = 25.64;

export const REST_LOOK: Look = { yaw: REST_YAW, pitch: REST_PITCH, mix: 1, spin: 0, wander: 0 };

/** The class a shape belongs to for pointer following. Sphere (blob) tracks a tighter cone like Grok's
 * sphere renderer; every other shape uses the wider cone; heart and wedge are damped further. */
export type BloubShapeKind = "sphere" | "nonSphere" | "heart" | "wedge";

export function bloubShapeKind(id: string): BloubShapeKind {
  switch (id) {
    case "blob":
    case "cercle":
      return "sphere";
    case "heart":
    case "coeur":
      return "heart";
    case "wedge":
    case "triangle":
      return "wedge";
    default:
      return "nonSphere";
  }
}

interface FollowCone { yaw: number; pitch: number; px: number; py: number }
/** Grok's `da`: gaze amplitude in degrees and translation parallax in body-radius units. */
const SPHERE_CONE: FollowCone = { yaw: 18, pitch: 14, px: 0.03, py: 0.024 };
const NON_SPHERE_CONE: FollowCone = { yaw: 26, pitch: 19, px: 0.07, py: 0.055 };
const KIND_FACTOR: Record<BloubShapeKind, number> = { sphere: 1, nonSphere: 1, heart: 0.6, wedge: 0.55 };

export interface FollowTarget {
  /** gaze yaw offset, degrees right positive */
  yaw: number;
  /** gaze pitch offset, degrees up positive */
  pitch: number;
  /** parallax, body-radius units, right positive */
  px: number;
  /** parallax, body-radius units, up positive */
  py: number;
}

/** The pointer's follow target. `nx` = right positive, `ny` = UP positive (screen y already negated),
 * both clamped to ±1 by the caller. */
export function followTarget(kind: BloubShapeKind, nx: number, ny: number): FollowTarget {
  const cone = kind === "sphere" ? SPHERE_CONE : NON_SPHERE_CONE;
  const f = KIND_FACTOR[kind];
  return { yaw: cone.yaw * f * nx, pitch: cone.pitch * f * ny, px: cone.px * f * nx, py: cone.py * f * ny };
}

/** Grok's exponential approach: each 1/60 s leaves 86% of the gap (`1 - .86^(60·dt)`). No spring, no
 * overshoot. Used for both the follow orientation and the hold factor. */
export const FOLLOW_DECAY = 0.86;

export function followAlpha(dt: number): number {
  return 1 - Math.pow(FOLLOW_DECAY, Math.max(0, dt) * 60);
}

/** One exponential step toward `target`; snaps when within `snap` (default 0.001). */
export function approach(current: number, target: number, dt: number, snap = 0.001): number {
  const next = current + (target - current) * followAlpha(dt);
  return Math.abs(target - next) < snap ? target : next;
}
