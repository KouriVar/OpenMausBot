import { describe, expect, it } from "vitest";

import { PITCH, PITCH_MAX, SPIN, TURN, YAW_MAX, lookTarget } from "./bloub-gaze";

describe("where Bloub looks", () => {
  it("rests turned to the panel, above the equator, when the pointer is centred", () => {
    const look = lookTarget({ nx: 0, ny: 0, tour: 1, pointer: true });
    expect(look.yaw).toBe(-TURN);
    expect(look.pitch).toBe(PITCH);
    expect(look.mix).toBe(1);
    expect(look.spin).toBe(0);
    expect(look.wander).toBe(0);
  });

  it("turns toward the pointer on both axes, and the signs are the screen's", () => {
    const right = lookTarget({ nx: 1, ny: 0, tour: 1, pointer: true });
    expect(right.yaw).toBe(-TURN + YAW_MAX);
    const left = lookTarget({ nx: -1, ny: 0, tour: 1, pointer: true });
    expect(left.yaw).toBe(-TURN - YAW_MAX);
    // a pointer below the bot (ny > 0) lowers the gaze, so pitch drops
    expect(lookTarget({ nx: 0, ny: 1, tour: 1, pointer: true }).pitch).toBe(PITCH - PITCH_MAX);
    expect(lookTarget({ nx: 0, ny: -1, tour: 1, pointer: true }).pitch).toBe(PITCH + PITCH_MAX);
  });

  it("gives the wander back when no pointer is known, and unwinds the spin as the arrival lands", () => {
    expect(lookTarget({ nx: 0, ny: 0, tour: 1, pointer: false }).wander).toBe(1);
    expect(lookTarget({ nx: 0, ny: 0, tour: 0, pointer: true }).spin).toBe(SPIN);
    expect(lookTarget({ nx: 0, ny: 0, tour: 1, pointer: true }).spin).toBe(0);
  });
});
