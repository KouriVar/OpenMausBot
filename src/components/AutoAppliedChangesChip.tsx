import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { autoAppliedTitle, type AutoAppliedKind } from "@/lib/auto-applied";

/** Fork: the changes a reply applied on its own belong inside that reply's bubble, not as rows of their own in the
 * transcript. One card folds them: closed it names what landed, open it grows downward with the same rows (Undo and
 * Details still there) they used to show. */
export function AutoAppliedChangesChip({ rows, kinds, joinAbove }: {
  rows: ReactNode[];
  kinds: readonly AutoAppliedKind[];
  joinAbove?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (rows.length === 0) return null;
  const title = autoAppliedTitle(kinds);
  return (
    // The bubble's own bottom padding is 7px; the 5px under the card makes the gap 12px, the same 12px the bubble's
    // px-3 leaves at the card's sides.
    <div data-auto-applied-changes="" className={cn("mt-2 mb-[5px]", joinAbove && "mt-0")}>
      <div className="w-full overflow-hidden rounded-xl bg-ink/[0.04]">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-2.5 py-1.5 text-left text-ink-secondary hover:bg-ink/[0.03] hover:text-ink"
        >
          <span className="min-w-0 truncate text-sm">{t(title.key, title.params)}</span>
          <ChevronRight size={14} aria-hidden="true" className={cn("shrink-0 transition-transform duration-150", open && "-rotate-90")} />
        </button>
        {open && <div className="flex flex-col gap-1.5 px-2.5 pb-2 pt-0.5 text-left">{rows}</div>}
      </div>
    </div>
  );
}
