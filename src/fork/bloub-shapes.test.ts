import { describe, expect, it } from "vitest";

import { PROFILE_SAMPLES } from "@/vendor/bloub/profiles";
import {
  BLOUB_SHAPE_COUNT,
  GROK_SHAPE_ORDER,
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

  it("builds a sane house profile: house-shaped, normalised near 1.02", () => {
    const house = bloubShapeRadii("house");
    expect(isSane(house)).toBe(true);
    expect(Math.max(...house!)).toBeGreaterThan(0.99);
    const circle = bloubShapeRadii("blob")!;
    expect(house!.some((r, i) => Math.abs(r - circle[i]!) > 0.05)).toBe(true);
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
