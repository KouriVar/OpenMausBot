import { Star } from "lucide-react";

import { cn } from "@/lib/cn";

/** The chief of staff's badge: the orange disc with a white filled star, ringed in whatever surface it sits on, tucked
 * onto the avatar's bottom-right so it overlaps the round body by about a third. One component for every chief. */
export function ChiefBadge({ ring, className }: { ring: string; className?: string }) {
  return (
    <span
      data-testid="chief-badge"
      aria-hidden="true"
      className={cn("absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full bg-[#E8993A] text-white", ring, className)}
    >
      <Star size={10} strokeWidth={0} fill="currentColor" aria-hidden="true" />
    </span>
  );
}
