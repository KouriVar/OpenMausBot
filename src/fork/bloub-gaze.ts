/** Where the bot looks while it follows the pointer — Bloub's own rule, ported from its
 * `src/ui/gaze.ts` unchanged (angles, sign, and the turn). Pure: it takes a pointer
 * already normalised to -1..1, so it is testable without a DOM. */

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
    // pitch positive looks up, while the screen's y goes down
    pitch: PITCH - ny * PITCH_MAX,
    mix: tour,
    spin: SPIN * (1 - tour),
    // Without a pointer the head stays turned to the panel, but gets its wander back:
    // otherwise the bot stares at a dead point.
    wander: pointer ? 0 : 1,
  };
}

/** Pointer following, not the arrival view: right/left and up/down in screen terms, no left-turn offset. */
export function followLook(nx: number, ny: number, baseYaw = 0, basePitch = 0): Look {
  return {
    yaw: baseYaw + nx * YAW_MAX,
    // screen y grows downward; Bloub's pitch is positive looking up
    pitch: basePitch - ny * PITCH_MAX,
    mix: 1,
    spin: 0,
    wander: 0,
  };
}
