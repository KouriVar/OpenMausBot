import { describe, expect, it } from "vitest";

import { PROFILE_SAMPLES } from "@/vendor/bloub/profiles";
import { EXTRA_SHAPES, GROK_SHAPE_ORDER, bloubShapeRadii } from "./bloub-shapes";

describe("Grok's five extra shapes", () => {
  it("are parameterised profiles on the same sample count as Bloub's", () => {
    for (const shape of EXTRA_SHAPES) {
      expect(shape.radii, shape.id).toHaveLength(PROFILE_SAMPLES);
      expect(shape.radii.every((r) => Number.isFinite(r) && r > 0.05), shape.id).toBe(true);
      expect(Math.max(...shape.radii)).toBeLessThanOrEqual(1.05);
    }
  });

  it("differ from a plain circle and from each other, so morphing is visible", () => {
    const circle = bloubShapeRadii("cercle")!;
    const seen = new Set<string>();
    for (const shape of EXTRA_SHAPES) {
      expect(shape.radii.some((r, i) => Math.abs(r - circle[i]!) > 0.05), shape.id).toBe(true);
      seen.add(shape.radii.map((r) => r.toFixed(2)).join(","));
    }
    expect(seen.size).toBe(EXTRA_SHAPES.length);
  });

  it("sits in the 5 + 5 + 3 Grok order with Bloub's eight first", () => {
    expect(GROK_SHAPE_ORDER).toHaveLength(13);
    expect(GROK_SHAPE_ORDER.slice(0, 8)).toEqual(["cercle", "galet", "squircle", "capsule", "triangle", "hexagone", "nuage", "goutte"]);
  });
});
