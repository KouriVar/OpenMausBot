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
