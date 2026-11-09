import { describe, expect, it } from "vitest";

import { PITCH, PITCH_MAX, REST_LOOK, REST_PITCH, REST_ROLL, REST_YAW, SPIN, TURN, YAW_MAX, approach, bloubShapeKind, followTarget, lookTarget } from "./bloub-gaze";

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

describe("Grok rest pose and follow", () => {
  it("uses Grok's authored rest orientation", () => {
    expect(REST_PITCH).toBeCloseTo(18.06, 2);
    expect(REST_YAW).toBeCloseTo(18.11, 2);
    expect(REST_ROLL).toBeCloseTo(25.64, 2);
    expect(REST_LOOK).toEqual({ yaw: REST_YAW, pitch: REST_PITCH, mix: 1, spin: 0, wander: 0 });
  });

  it("classifies shapes: blob is the sphere, heart and wedge are damped, the rest are non-sphere", () => {
    expect(bloubShapeKind("blob")).toBe("sphere");
    expect(bloubShapeKind("cercle")).toBe("sphere");
    expect(bloubShapeKind("heart")).toBe("heart");
    expect(bloubShapeKind("coeur")).toBe("heart");
    expect(bloubShapeKind("wedge")).toBe("wedge");
    expect(bloubShapeKind("triangle")).toBe("wedge");
    expect(bloubShapeKind("cloud")).toBe("nonSphere");
    expect(bloubShapeKind("hex")).toBe("nonSphere");
  });

  it("spheres track ±18°/±14° with a small parallax; other shapes ±26°/±19° with more", () => {
    const s = followTarget("sphere", 1, 1);
    expect(s.yaw).toBeCloseTo(18, 5);
    expect(s.pitch).toBeCloseTo(14, 5);
    expect(s.px).toBeCloseTo(0.03, 5);
    expect(s.py).toBeCloseTo(0.024, 5);
    const n = followTarget("nonSphere", 1, 1);
    expect(n.yaw).toBeCloseTo(26, 5);
    expect(n.pitch).toBeCloseTo(19, 5);
    expect(n.px).toBeCloseTo(0.07, 5);
    expect(n.py).toBeCloseTo(0.055, 5);
  });

  it("damps heart (0.6) and wedge (0.55) against the non-sphere cone", () => {
    expect(followTarget("heart", 1, 0).yaw).toBeCloseTo(26 * 0.6, 5);
    expect(followTarget("wedge", 0, 1).pitch).toBeCloseTo(19 * 0.55, 5);
  });

  it("keeps the sign: right pointer → +yaw, up pointer → +pitch", () => {
    expect(followTarget("sphere", -1, 0).yaw).toBeCloseTo(-18, 5);
    expect(followTarget("sphere", 0, -1).pitch).toBeCloseTo(-14, 5);
  });

  it("approaches exponentially with the 0.86 per-frame decay and snaps within 0.001", () => {
    // one 1/60 s step leaves 86% of the gap
    const step = approach(0, 1, 1 / 60);
    expect(step).toBeCloseTo(0.14, 4);
    // a long dt is a full alpha and lands
    expect(approach(0, 1, 1)).toBe(1);
    // snaps once within 0.001
    expect(approach(0.9995, 1, 1 / 600)).toBe(1);
    // monotonic approach toward the target, no overshoot
    let v = 0;
    for (let i = 0; i < 120; i += 1) {
      const next = approach(v, 1, 1 / 60);
      expect(next).toBeGreaterThanOrEqual(v);
      expect(next).toBeLessThanOrEqual(1);
      v = next;
    }
    expect(v).toBe(1);
  });

  it("returns toward rest on release: hold decays to 0 within ~0.5 s", () => {
    let hold = 1;
    let frames = 0;
    while (hold > 0.001 && frames < 120) {
      hold = approach(hold, 0, 1 / 60, 0.02);
      frames += 1;
    }
    // 0.5 s = 30 frames; it must have returned by then
    expect(frames).toBeLessThanOrEqual(30);
    expect(hold).toBe(0);
  });
});
