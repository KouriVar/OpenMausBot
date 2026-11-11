import { RiStarFill } from "@remixicon/react";

import { cn } from "@/lib/cn";

/** The chief of staff's badge: the orange disc with a white filled star, ringed in whatever surface it sits on, tucked
 * onto the avatar's bottom-right so it overlaps the round body by about a third. One component for every chief. */
export function ChiefBadge({ ring, className }: { ring: string; className?: string }) {
  return (
    <span
      data-testid="chief-badge"
      aria-hidden="true"
      className={cn("absolute bottom-0 right-0 flex size-4 items-center justify-center rounded-full bg-[#E8993A] text-white", ring, className)}
    >
      <RiStarFill size={11} aria-hidden="true" />
    </span>
  );
}
