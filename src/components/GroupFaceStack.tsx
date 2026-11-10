import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Grok's group avatar: the members in one row, each face riding over the one before it, every face sitting
 * on a disc in the colour *behind* the stack. The disc plus its ring is what turns an overlap into a clean
 * cut — the face underneath is simply covered — so the surface must be the host's own: `var(--color-panel)`
 * in the sidebar, `var(--color-app)` in the chat header. Taking the surface from the skin's tokens also
 * makes light and dark follow without a second rule. */
export function GroupFaceStack({
  faces,
  total = faces.length,
  face,
  overlap,
  surface,
  ringWidth = 2,
  className,
}: {
  /** The faces, in reading order; the caller decides how many are drawn. */
  faces: ReactNode[];
  /** The group's real member count, so the tail can say how many faces are not shown. */
  total?: number;
  /** One face's diameter, in px. */
  face: number;
  /** How far each face rides over the one before it. Defaults to 38% of `face`. */
  overlap?: number;
  /** The colour of the surface behind the stack: the disc each face sits on and its ring. */
  surface: string;
  ringWidth?: number;
  className?: string;
}) {
  // Overlap has to beat the ring, or the cut ring would show as a stripe inside the next face.
  const step = Math.min(face - ringWidth - 1, Math.max(3, Math.round(overlap ?? face * 0.38)));
  const hidden = Math.max(0, total - faces.length);
  const disc = { background: surface, boxShadow: `0 0 0 ${ringWidth}px ${surface}` };
  return (
    <span data-group-faces className={cn("flex shrink-0 items-center", className)}>
      {faces.map((node, index) => (
        // The faces are the caller's; their order is the only identity a stack has.
        <span
          key={index}
          data-group-face=""
          className="relative flex shrink-0 items-center justify-center rounded-full"
          style={{ ...disc, width: face, height: face, marginLeft: index === 0 ? undefined : -step, zIndex: faces.length + 1 - index }}
        >
          {node}
        </span>
      ))}
      {hidden > 0 && (
        <span
          data-group-face-more=""
          className="relative flex shrink-0 items-center justify-center rounded-full bg-raised font-medium tabular-nums text-ink-secondary"
          style={{
            boxShadow: `0 0 0 ${ringWidth}px ${surface}`,
            width: face,
            height: face,
            marginLeft: -step,
            zIndex: 0,
            fontSize: Math.max(9, Math.round(face * 0.42)),
          }}
        >
          +{hidden}
        </span>
      )}
    </span>
  );
}

export type GroupFaceClusterLayout = "pair" | "triad" | "quad";

/** One face's diameter inside a square cluster of this size. */
export function clusterFaceSize(size: number, layout: GroupFaceClusterLayout): number {
  return Math.round(size * (layout === "pair" ? 0.6 : layout === "quad" ? 0.52 : 0.56));
}

/** The same faces filling one square, for the place a single avatar would sit: two members take opposite
 * corners (one upper left, one lower right) and three or more stand as a pyramid, one on top and two
 * below. The square stays exactly the size a single face gets — which is what the sidebar row, and the
 * collapsed rail's tile, are sized around — and no tail counts the members left out; a group row already
 * says how many it holds in the room itself. Every face keeps the stack's disc and ring, so each overlap
 * is a clean cut on the row's own background. */
export function GroupFaceCluster({
  faces,
  layout,
  size,
  surface,
  ringWidth = 2,
}: {
  /** The faces, in reading order; only as many as the layout holds are drawn. */
  faces: ReactNode[];
  /** `pair` for two members, `triad` for three or more. */
  layout: GroupFaceClusterLayout;
  /** The cluster's square, which is also the square a single avatar gets. */
  size: number;
  /** The colour behind the cluster: the disc each face sits on and its ring. */
  surface: string;
  ringWidth?: number;
}) {
  const face = clusterFaceSize(size, layout);
  const edge = size - face;
  // Quad pulls every corner toward the centre by a little, so the four faces overlap one another instead of
  // meeting at a cross; the top-left one paints last and its ring cuts the two it covers.
  const inset = Math.round(face * 0.14);
  const places = layout === "pair"
    ? [{ left: 0, top: 0 }, { left: edge, top: edge }]
    : layout === "triad"
      ? [{ left: Math.round(edge / 2), top: 0 }, { left: 0, top: edge }, { left: edge, top: edge }]
      : [
        { left: inset, top: inset },
        { left: edge - inset, top: inset },
        { left: inset, top: edge - inset },
        { left: edge - inset, top: edge - inset },
      ];
  const disc = { background: surface, boxShadow: `0 0 0 ${ringWidth}px ${surface}` };
  return (
    <span
      data-group-faces
      data-group-faces-shape={layout}
      className="relative block shrink-0"
      style={{ width: size, height: size }}
    >
      {faces.slice(0, places.length).map((node, index) => {
        // The first face paints over the ones it covers, as in the row.
        const place = places[index]!;
        return (
          <span
            key={index}
            data-group-face=""
            className="absolute flex items-center justify-center rounded-full"
            style={{ ...disc, ...place, width: face, height: face, zIndex: places.length - index }}
          >
            {node}
          </span>
        );
      })}
    </span>
  );
}
