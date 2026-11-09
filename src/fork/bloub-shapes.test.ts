import { describe, expect, it } from "vitest";

import { PROFILE_SAMPLES } from "@/vendor/bloub/profiles";
import {
  BLOUB_SHAPE_COUNT,
  GROK_SHAPE_ORDER,
  SHAPE_PEAK,
  bloubShapeChoices,
  bloubShapeRadii,
  isBloubShape,
  normalizeShapeId,
} from "./bloub-shapes";

const isSane = (radii: number[] | null): boolean =>
  radii !== null &&
  radii.length === PROFILE_SAMPLES &&
  radii.every((r) => Number.isFinite(r) && r > 0.05) &&
  Math.max(...radii) <= 1.2;

describe("Grok's canonical shape catalog", () => {
  it("orders 13 panel shapes, starting with the first row 5+5+3", () => {
    expect(GROK_SHAPE_ORDER).toHaveLength(13);
    expect(GROK_SHAPE_ORDER.slice(0, 5)).toEqual(["blob", "cloud", "square", "sparkle", "clover"]);
  });

  it("has radii for all 13 panel shapes plus the hidden pebble, without gaps", () => {
    for (const id of [...GROK_SHAPE_ORDER, "pebble"]) {
      expect(isSane(bloubShapeRadii(id)), id).toBe(true);
    }
  });

  it("maps blob to the vendor circle: same sample count, all ~1", () => {
    const blob = bloubShapeRadii("blob");
    expect(blob).not.toBeNull();
    expect(blob).toHaveLength(PROFILE_SAMPLES);
    expect(blob!.every((r) => Math.abs(r - 1) < 1e-9)).toBe(true);
  });

  it("resolves legacy ids to the same radii as their replacements", () => {
    expect(bloubShapeRadii("cercle")).toEqual(bloubShapeRadii("blob"));
    expect(bloubShapeRadii("galet")).toEqual(bloubShapeRadii("pebble"));
    expect(bloubShapeRadii("nuage")).toEqual(bloubShapeRadii("cloud"));
    expect(bloubShapeRadii("squircle")).toEqual(bloubShapeRadii("square"));
    expect(bloubShapeRadii("capsule")).toEqual(bloubShapeRadii("tablet"));
    expect(bloubShapeRadii("triangle")).toEqual(bloubShapeRadii("wedge"));
    expect(bloubShapeRadii("hexagone")).toEqual(bloubShapeRadii("hex"));
    expect(bloubShapeRadii("goutte")).toEqual(bloubShapeRadii("teardrop"));
    expect(bloubShapeRadii("etoile4")).toEqual(bloubShapeRadii("sparkle"));
    expect(bloubShapeRadii("fleur")).toEqual(bloubShapeRadii("clover"));
    expect(bloubShapeRadii("coeur")).toEqual(bloubShapeRadii("heart"));
    expect(bloubShapeRadii("nuageFest")).toEqual(bloubShapeRadii("flower"));
    expect(bloubShapeRadii("etoile5")).toEqual(bloubShapeRadii("star"));
  });

  it("builds a sane house profile: a plump house, peak just under one radius", () => {
    const house = bloubShapeRadii("house")!;
    expect(isSane(house)).toBe(true);
    expect(Math.max(...house)).toBeCloseTo(SHAPE_PEAK, 3);
    const circle = bloubShapeRadii("blob")!;
    expect(house.some((r, i) => Math.abs(r - circle[i]!) > 0.05)).toBe(true);
  });

  it("keeps every authored shape fat, round and soft (no sharp tips, no thin waist)", () => {
    // The three rules from the picker comparison: shallow valleys, a full body, round corners.
    for (const id of ["sparkle", "clover", "heart", "flower", "teardrop", "wedge", "star", "house", "tablet"]) {
      const radii = bloubShapeRadii(id)!;
      const n = radii.length;
      const peak = Math.max(...radii);
      const valley = Math.min(...radii);
      const dTheta = (Math.PI * 2) / n;
      const area = radii.reduce((sum, r) => sum + 0.5 * r * r * dTheta, 0) / (Math.PI * peak * peak);
      // A house pentagon and a 1.45:1 tablet cannot reach the valley rule (their shortest ray is the
      // flat side, not a concavity); every lobed shape must.
      if (id !== "house" && id !== "tablet") expect(valley / peak, `${id} valley`).toBeGreaterThanOrEqual(0.72);
      if (id !== "house") expect(area, `${id} area`).toBeGreaterThanOrEqual(0.72);
      expect(peak, `${id} peak`).toBeLessThanOrEqual(SHAPE_PEAK + 1e-6);
    }
  });

  it("normalises legacy ids and passes unknown ids through", () => {
    expect(normalizeShapeId("hexagone")).toBe("hex");
    expect(normalizeShapeId("etoile4")).toBe("sparkle");
    expect(normalizeShapeId("blob")).toBe("blob");
    expect(normalizeShapeId("pebble")).toBe("pebble");
    expect(normalizeShapeId("notreal")).toBe("notreal");
  });

  it("accepts any real id but rejects unknown ones", () => {
    expect(isBloubShape("wedge")).toBe(true);
    expect(isBloubShape("cercle")).toBe(true);
    expect(isBloubShape("pebble")).toBe(true);
    expect(isBloubShape("notreal")).toBe(false);
    expect(bloubShapeRadii("notreal")).toBeNull();
  });

  it("offers 13 choices, turning only the clover", () => {
    const choices = bloubShapeChoices();
    expect(choices).toHaveLength(13);
    expect(choices.map((c) => c.id)).toEqual([...GROK_SHAPE_ORDER]);
    for (const choice of choices) {
      expect(choice.turn, choice.id).toBe(choice.id === "clover" ? 45 : 0);
    }
  });

  it("counts 13 panel shapes plus pebble", () => {
    expect(BLOUB_SHAPE_COUNT).toBe(14);
  });
});
