import { PROFILE_SAMPLES } from "@/vendor/bloub/profiles";
import { SHAPE_BY_ID } from "@/vendor/bloub/skins";
import { profileFromPolygon, unionOfCirclesProfile } from "@/vendor/bloub/shape";

/** Radial samples for every shape: a radii array around the same sample count, so a morph between
 * any two is a plain interpolation. */
const ANGLES = Array.from({ length: PROFILE_SAMPLES }, (_, i) => (i / PROFILE_SAMPLES) * Math.PI * 2);

const normalise = (radii: number[], max = 1): number[] => {
  const peak = Math.max(...radii);
  return peak <= 0 ? radii : radii.map((r) => (r * max) / peak);
};

/** Every shape this file builds is normalised to this peak: just under 1 body radius, so a small face
 * drawn without the ring's padding still cannot touch the viewBox edge. */
export const SHAPE_PEAK = 0.98;
const normalisePlain = normalise;

/** A soft lobed outline: `lobes` bumps, `depth` how shallow the valleys cut in (valley = 1 − depth).
 * A cosine profile has no cusps at all, so a tip is a wide round bump rather than a point — which is
 * exactly the "fat, round, soft" look Grok's picker has. */
const softLobes = (lobes: number, depth: number, phase = 0, crestPower = 1): number[] =>
  normalisePlain(ANGLES.map((a) => {
    // crest 0 at a valley, 1 at a bump; the valley is exactly (1 - depth) of the peak.
    const crest = 0.5 + 0.5 * Math.cos(lobes * (a + phase));
    return 1 - depth + depth * Math.pow(crest, crestPower);
  }), SHAPE_PEAK);

/** A closed polygon whose corners are replaced by arcs of radius `rc` that are TANGENT to both edges.
 * The tangent length is clamped to what the two edges can spare, so neighbouring arcs can never overlap
 * (a Minkowski push-out does overlap once `rc` approaches half an edge, which is what turned the house
 * into a star). Returns radii sampled from the centroid. */
const filletPolygon = (verts: Array<{ x: number; y: number }>, rc: number, arcSteps = 10): number[] => {
  const n = verts.length;
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i += 1) {
    const v = verts[i]!;
    const a = verts[(i - 1 + n) % n]!;
    const b = verts[(i + 1) % n]!;
    const la = Math.hypot(a.x - v.x, a.y - v.y) || 1;
    const lb = Math.hypot(b.x - v.x, b.y - v.y) || 1;
    const u1 = { x: (a.x - v.x) / la, y: (a.y - v.y) / la };
    const u2 = { x: (b.x - v.x) / lb, y: (b.y - v.y) / lb };
    // interior half-angle at this corner
    const cosTheta = Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y));
    const half = Math.acos(cosTheta) / 2;
    const sinHalf = Math.sin(half);
    if (sinHalf < 1e-6) { out.push(v); continue; }
    let t = rc / Math.tan(half);
    t = Math.min(t, 0.45 * Math.min(la, lb));
    const r = t * Math.tan(half); // the radius this clamped tangent length actually gives
    const bis = { x: u1.x + u2.x, y: u1.y + u2.y };
    const bl = Math.hypot(bis.x, bis.y) || 1;
    const centre = { x: v.x + (bis.x / bl) * (r / sinHalf), y: v.y + (bis.y / bl) * (r / sinHalf) };
    const p1 = { x: v.x + u1.x * t, y: v.y + u1.y * t };
    const p2 = { x: v.x + u2.x * t, y: v.y + u2.y * t };
    const a0 = Math.atan2(p1.y - centre.y, p1.x - centre.x);
    let d = Math.atan2(p2.y - centre.y, p2.x - centre.x) - a0;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    for (let k = 0; k <= arcSteps; k += 1) {
      const ang = a0 + (d * k) / arcSteps;
      out.push({ x: centre.x + Math.cos(ang) * r, y: centre.y + Math.sin(ang) * r });
    }
  }
  return profileFromPolygon(out, 0, 0);
};

/** Lifts the valleys toward the peak by `amount` (0 = untouched): a shape built from circle unions has a
 * waist where the circles meet, and this is what turns it soft rather than pinched. The silhouette keeps
 * its identity because only the concave parts move. */
const soften = (radii: number[], amount: number): number[] => {
  const peak = Math.max(...radii);
  return normalisePlain(radii.map((r) => r + (peak - r) * amount), SHAPE_PEAK);
};

/** A fat heart, built as the union of three circles: two plump lobes and a round bottom (no sharp
 * point at the bottom, which is what a raw heart curve gives). */
const heart = (): number[] =>
  normalisePlain(unionOfCirclesProfile([
    { x: -0.18, y: -0.15, r: 0.49 },
    { x: 0.18, y: -0.15, r: 0.49 },
    { x: 0, y: 0.19, r: 0.47 },
  ]), SHAPE_PEAK);

/** A wide teardrop: a big bottom circle (its diameter is about 0.9 of the total width) plus a short,
 * rounded tip — unioned, so there is no thin neck between them. */
const teardrop = (): number[] =>
  soften(unionOfCirclesProfile([
    { x: 0, y: 0.17, r: 0.44 },   // the round bottom: its diameter is ~0.9 of the width
    { x: 0, y: -0.13, r: 0.47 },  // and a short, round tip above it
  ]), 0.3);

/** A thick capsule lying on its side, about 1.45 wide for 1 tall. */
const tablet = (): number[] =>
  normalisePlain(filletPolygon([
    { x: -0.725, y: -0.5 },
    { x: 0.725, y: -0.5 },
    { x: 0.725, y: 0.5 },
    { x: -0.725, y: 0.5 },
  ], 0.34), SHAPE_PEAK);

/** A wedge as a three-lobed round triangle: three big arcs with shallow valleys between them, so the
 * apex is an arc and never a point — nothing can clip, and the body stays plump. */
const wedge = (): number[] => softLobes(3, 0.28, -Math.PI / 2);



/** A plump house: flat base, upright sides, a triangular roof, every corner rounded. */
const house = (): number[] =>
  normalisePlain(filletPolygon([
    { x: -0.5, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: -0.06 },
    { x: 0, y: -0.56 },
    { x: -0.5, y: -0.06 },
  ], 0.26), SHAPE_PEAK);

/** Vendor radii, looked up by Bloub's own id (the shapes the engine already ships). */
const vendorRadii = (id: string): number[] => {
  const shape = SHAPE_BY_ID.get(id);
  if (!shape) throw new Error(`unknown vendor shape: ${id}`);
  return shape.radii;
};

/** The canonical catalog, keyed by Grok's shape ids. `pebble` is renderable but hidden from the panel.
 * Everything here is deliberately fat, round and soft: shallow valleys (≥ 0.72 of the peak), no cusps
 * (every corner is an arc of at least 0.18 body radii), and a full centre so the eyes always sit on
 * solid body. */
const CATALOG: ReadonlyMap<string, number[]> = new Map<string, number[]>([
  ["blob", vendorRadii("cercle")],
  ["cloud", vendorRadii("nuage")],
  ["square", vendorRadii("squircle")],
  ["sparkle", softLobes(4, 0.24)],                    // four fat rounded petals, 0.76 valleys
  ["clover", softLobes(4, 0.18, Math.PI / 4)],        // shallower still, a big solid centre
  ["heart", heart()],
  ["flower", softLobes(8, 0.07)],                     // eight shallow bumps
  ["teardrop", teardrop()],
  ["tablet", tablet()],
  ["wedge", wedge()],
  ["house", house()],
  ["star", softLobes(5, 0.26, -Math.PI / 2)],         // five short round points, 0.74 valleys
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
