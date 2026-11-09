import { PROFILE_SAMPLES } from "@/vendor/bloub/profiles";
import { SHAPE_BY_ID } from "@/vendor/bloub/skins";
import { profileFromPolygon } from "@/vendor/bloub/shape";

/** Radial samples for every shape: a radii array around the same sample count, so a morph between
 * any two is a plain interpolation. */
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

/** A rounded pentagon "bottom square, pointed top" — a house/home silhouette.
 * Points are centred on the origin with y down positive (screen space). */
const house = (): number[] => {
  // About 1.0 wide and 1.05 tall: a flat base, vertical sides, and a triangular roof.
  const pts = [
    { x: -0.5, y: 0.55 },
    { x: 0.5, y: 0.55 },
    { x: 0.5, y: -0.02 },
    { x: 0, y: -0.5 },
    { x: -0.5, y: -0.02 },
  ];
  return normalise(profileFromPolygon(pts, 0, 0), 1.02);
};

/** An n-point star: `points` narrow arms, tips exactly at `phase + k·(2π/points)` and `inner` at the
 * valleys, each arm a rounded bell so the tip reads as filed-down rather than cusped. Written as one
 * analytic radius function so every arm is identical by construction — only the 64-sample grid differs
 * between them, which is a fraction of a pixel at the sizes the app draws (measured spread ≈ 0.5%). */
const starArms = (points: number, inner: number, phase: number, spreadDeg: number): number[] => {
  const step = (2 * Math.PI) / points;
  const width = (spreadDeg * Math.PI) / 180;
  return normalise(ANGLES.map((a) => {
    let d = (((a - phase) % step) + step) % step;
    d = Math.min(d, step - d); // distance to the nearest tip, 0 .. step/2
    return inner + (1 - inner) * Math.exp(-((d / width) ** 2));
  }), 1.02);
};

/** A four-point sparkle: concave sides running into four sharp tips at `phase + k·90°`, with a full
 * centre block for the eyes. Its tips fall exactly on the 64-sample grid, so it is perfectly symmetric
 * (measured tip-length spread: 0). */
const sparkleArms = (inner: number, phase: number, sharp: number): number[] => {
  const depth = 1 - inner;
  let r = ANGLES.map((a) => {
    const c = 0.5 + 0.5 * Math.cos(4 * (a - phase));
    return 1 - depth + depth * Math.pow(c, sharp);
  });
  // One symmetric 1-2-1 pass: a sharp tip lands on a single sample, and without this the path
  // smoothing leaves a dimple right at the point. Equal weights keep the four tips identical.
  const n = r.length;
  r = r.map((v, i) => (r[(i - 1 + n) % n]! + 2 * v + r[(i + 1) % n]!) / 4);
  return normalise(r, 1.02);
};

/** A puffy flower: `lobes` gentle rounded bumps, low amplitude — a fat scalloped cloud, no spikes. */
const puffs = (lobes: number, depth: number): number[] =>
  normalise(ANGLES.map((a) => 1 - depth + depth * Math.cos(lobes * a)), 1.02);

/** Vendor radii, looked up by Bloub's own id (the shapes the engine already ships). */
const vendorRadii = (id: string): number[] => {
  const shape = SHAPE_BY_ID.get(id);
  if (!shape) throw new Error(`unknown vendor shape: ${id}`);
  return shape.radii;
};

/** The canonical catalog, keyed by Grok's shape ids. `pebble` is renderable but hidden from the panel. */
const CATALOG: ReadonlyMap<string, number[]> = new Map<string, number[]>([
  ["blob", vendorRadii("cercle")],
  ["cloud", vendorRadii("nuage")],
  ["square", vendorRadii("squircle")],
  ["sparkle", sparkleArms(0.42, 0, 3)],
  ["clover", lobed(4, 0.3, Math.PI / 4)],
  ["heart", heart()],
  ["flower", puffs(8, 0.08)],
  ["teardrop", vendorRadii("goutte")],
  ["tablet", vendorRadii("capsule")],
  ["wedge", vendorRadii("triangle")],
  ["house", house()],
  ["star", starArms(5, 0.33, -Math.PI / 2, 24)],
  ["hex", vendorRadii("hexagone")],
  ["pebble", vendorRadii("galet")],
]);

/** Bloub's old ids resolve to their Grok replacements so stored skins keep working. */
const LEGACY_TO_GROK: Readonly<Record<string, string>> = {
  cercle: "blob",
  galet: "pebble",
  nuage: "cloud",
  squircle: "square",
  capsule: "tablet",
  triangle: "wedge",
  hexagone: "hex",
  goutte: "teardrop",
  etoile4: "sparkle",
  fleur: "clover",
  coeur: "heart",
  nuageFest: "flower",
  etoile5: "star",
};

/** Grok's order: 13 shapes, laid out 5 + 5 + 3 in the picker. */
export const GROK_SHAPE_ORDER: readonly string[] = [
  "blob",
  "cloud",
  "square",
  "sparkle",
  "clover",
  "heart",
  "flower",
  "teardrop",
  "tablet",
  "wedge",
  "house",
  "star",
  "hex",
];

/** Per-shape profile rotation (degrees), applied by the renderer. Only clover turns. */
const TURNS: Readonly<Record<string, number>> = { clover: 45 };

/** Legacy id -> new id; unknown ids pass through unchanged. */
export function normalizeShapeId(id: string): string {
  return LEGACY_TO_GROK[id] ?? id;
}

/** Radii for a new id, a legacy id, or "pebble"; null when the id is unknown. */
export function bloubShapeRadii(id: string): number[] | null {
  return CATALOG.get(normalizeShapeId(id)) ?? null;
}

/** The 13 panel shapes, in Grok's order, with their profile rotation. */
export function bloubShapeChoices(): ReadonlyArray<{ id: string; turn: number }> {
  return GROK_SHAPE_ORDER.map((id) => ({ id, turn: TURNS[id] ?? 0 }));
}

/** True for any new id, any legacy id, and "pebble". */
export function isBloubShape(id: string): boolean {
  return CATALOG.has(normalizeShapeId(id));
}

/** 13 panel shapes plus the hidden "pebble". */
export const BLOUB_SHAPE_COUNT = GROK_SHAPE_ORDER.length + 1;
