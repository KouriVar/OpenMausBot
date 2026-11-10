import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/cn";
import { SIDEBAR_ICON_BUTTON, SIDEBAR_ICON_SIZE, SIDEBAR_ICON_STROKE } from "./sidebar-icon-column";

// Where this window works, the inbox, search and + at the foot of the icon sidebar, just above the tools button.
export function SidebarBottomActions({ onSearch, searchLabel, plus, place, inbox }: {
  onSearch: () => void;
  searchLabel: string;
  plus: ReactNode;
  place?: ReactNode;
  inbox?: ReactNode;
}) {
  return (
    <div data-sidebar-bottom-actions className="flex flex-col items-center gap-1 px-2 pb-1">
      {place}
      {inbox}
      <button
        type="button"
        onClick={onSearch}
        aria-label={searchLabel}
        title={searchLabel}
        className={cn(SIDEBAR_ICON_BUTTON, "text-ink-secondary hover:bg-raised hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus")}
      >
        <Search size={SIDEBAR_ICON_SIZE} strokeWidth={SIDEBAR_ICON_STROKE} />
      </button>
      <div className="relative flex">{plus}</div>
    </div>
  );
}
