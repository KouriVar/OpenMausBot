import type { ReactNode } from "react";
import { Search } from "lucide-react";

// Search and + at the foot of the icon sidebar, just above the tools button.
export function SidebarBottomActions({ onSearch, searchLabel, plus }: {
  onSearch: () => void;
  searchLabel: string;
  plus: ReactNode;
}) {
  return (
    <div data-sidebar-bottom-actions className="flex flex-col items-center gap-1 px-2 pb-1">
      <button
        type="button"
        onClick={onSearch}
        aria-label={searchLabel}
        title={searchLabel}
        className="flex size-[46px] shrink-0 items-center justify-center rounded-xl text-ink-secondary hover:bg-raised hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Search size={20} strokeWidth={1.5} />
      </button>
      <div className="relative flex">{plus}</div>
    </div>
  );
}
