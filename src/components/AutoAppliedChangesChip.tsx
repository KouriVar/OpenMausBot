import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { autoAppliedTitle, type AutoAppliedKind } from "@/lib/auto-applied";

/** Fork: the changes a reply applied on its own belong inside that reply's bubble, not as rows of their own in the
 * transcript. The chip folds them: closed it names what landed, open it shows the same rows (with Undo and Details)
 * they used to show. */
export function AutoAppliedChangesChip({ rows, kinds, joinAbove }: {
  rows: ReactNode[];
  kinds: readonly AutoAppliedKind[];
  joinAbove?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (rows.length === 0) return null;
  const title = autoAppliedTitle(kinds);
  return (
    <div data-auto-applied-changes="" className="mt-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl bg-ink/[0.04] px-2.5 py-1.5 text-left text-[12px] text-ink-secondary hover:bg-ink/[0.07] hover:text-ink",
          joinAbove && "mt-0",
        )}
      >
        <span className="truncate">{t(title.key, title.params)}</span>
        <ChevronDown size={14} aria-hidden="true" className={cn("shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-1.5 rounded-xl bg-ink/[0.03] px-2.5 py-2 text-left">
          {rows}
        </div>
      )}
    </div>
  );
}
