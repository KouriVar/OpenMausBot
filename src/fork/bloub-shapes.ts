import { PROFILE_SAMPLES } from "@/vendor/bloub/profiles";
import { SHAPES, SHAPE_BY_ID } from "@/vendor/bloub/skins";
import { profileFromPolygon } from "@/vendor/bloub/shape";

/** Five shapes Grok has beyond Bloub's eight, built the same way: a radii array around the same sample
 * count, so a morph between any two is a plain interpolation. */
export interface ExtraShape { id: string; radii: number[]; turn: number }

const ANGLES = Array.from({ length: PROFILE_SAMPLES }, (_, i) => (i / PROFILE_SAMPLES) * Math.PI * 2);
const normalise = (radii: number[], max = 1): number[] => {
  const peak = Math.max(...radii);
  return peak <= 0 ? radii : radii.map((r) => (r * max) / peak);
};
/** A radial star/petal: `lobes` maxima, `depth` how far the valleys cut in. */
const lobed = (lobes: number, depth: number, phase: number): number[] =>
  normalise(ANGLES.map((a) => Math.max(0.14, 1 - depth + depth * Math.cos(lobes * (a + phase)))), 1.02);
/** A heart/peach: a heart curve, sampled as a profile from its centre. */
const heart = (): number[] => {
  const pts = Array.from({ length: 96 }, (_, i) => {
    const t = (i / 96) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x / 17, y: y / 17 };
  });
  return normalise(profileFromPolygon(pts, 0, 0), 1.04);
};

export const EXTRA_SHAPES: ExtraShape[] = [
  { id: "etoile4", radii: lobed(4, 0.45, 0), turn: 0 },
  { id: "fleur", radii: lobed(4, 0.3, Math.PI / 4), turn: 45 },
  { id: "coeur", radii: heart(), turn: 0 },
  { id: "nuageFest", radii: lobed(9, 0.18, 0), turn: 0 },
  { id: "etoile5", radii: lobed(5, 0.42, -Math.PI / 2), turn: 0 },
];

/** Grok's order: the eight Bloub shapes then the five new ones, laid out 5+5+3 in the panel. */
export const GROK_SHAPE_ORDER: readonly string[] = [
  "cercle", "galet", "squircle", "capsule", "triangle",
  "hexagone", "nuage", "goutte", "etoile4", "fleur",
  "coeur", "nuageFest", "etoile5",
];

export function bloubShapeRadii(id: string): number[] | null {
  const extra = EXTRA_SHAPES.find((shape) => shape.id === id);
  if (extra) return extra.radii;
  return SHAPE_BY_ID.get(id)?.radii ?? null;
}

export function bloubShapeChoices(): ReadonlyArray<{ id: string; turn: number }> {
  return GROK_SHAPE_ORDER.map((id) => ({ id, turn: EXTRA_SHAPES.find((s) => s.id === id)?.turn ?? 0 }));
}

export const BLOUB_SHAPE_COUNT = SHAPES.length + EXTRA_SHAPES.length;
