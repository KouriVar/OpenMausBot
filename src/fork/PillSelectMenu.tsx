import { ChevronDown } from "lucide-react";

import { SidebarPopoverMenu, type SidebarMenuItem } from "@/components/SidebarPopoverMenu";
import { cn } from "@/lib/cn";

/** Fork: the group header's two dropdowns were native <select>s, so macOS drew its own blurred menu while the rest of
 * the app drew the app's menu. This keeps the pill's look and gives both the app's menu instead. */
export function PillSelectMenu({ label, title, ariaLabel, items, testId, className }: {
  label: string;
  title?: string;
  ariaLabel: string;
  items: SidebarMenuItem[];
  testId?: string;
  className?: string;
}) {
  return (
    <SidebarPopoverMenu
      items={items}
      ariaLabel={ariaLabel}
      placement="below"
      triggerClassName="shrink-0"
      triggerTitle={title}
      renderTrigger={({ open }) => (
        <span
          role="button"
          tabIndex={0}
          data-testid={testId}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "flex h-8 max-w-[190px] items-center gap-1 rounded-full border border-hairline/40 bg-raised/60 pl-2.5 pr-2 text-[13px] font-medium text-ink hover:bg-raised",
            open && "bg-raised",
            className,
          )}
        >
          <span className="min-w-0 truncate">{label}</span>
          <ChevronDown size={13} aria-hidden="true" className={cn("shrink-0 text-ink-secondary transition-transform", open && "rotate-180")} />
        </span>
      )}
    />
  );
}
