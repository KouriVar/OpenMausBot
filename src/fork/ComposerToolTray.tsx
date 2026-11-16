import { Check, GraduationCap, Paperclip, Plus, Target } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import type { Place } from "@/lib/place";
import type { Bot, Task } from "@/state/store";
import { approvalMenu } from "@/components/ComposerPlusMenu";
import { usePlaceMenuItem } from "@/components/PlaceChip";
import { SidebarPopoverMenu, type SidebarMenuItem } from "@/components/SidebarPopoverMenu";
import type { ApprovalChoice } from "@/components/thread-approval";

const check = <Check size={14} className="shrink-0 text-accent" aria-hidden="true" />;

export interface ComposerToolPlace {
  bot: Bot;
  task?: Pick<Task, "surface" | "surfaceAuto"> | null;
  disabled?: boolean;
  onPin: (surface: Place | null) => void;
}

interface TrayProps {
  onAttach: () => void;
  teachTask?: () => void;
  goal?: { on: boolean; onToggle: () => void };
  approval?: ApprovalChoice;
  place?: ComposerToolPlace;
}

function toolItems({ onAttach, teachTask, goal, approval, placeItem }: Omit<TrayProps, "place"> & { placeItem?: SidebarMenuItem }): SidebarMenuItem[] {
  const items: SidebarMenuItem[] = [
    { key: "attach", label: t("composer.attach"), icon: <Paperclip size={16} />, onSelect: onAttach },
  ];
  if (teachTask) items.push({ key: "teach", label: t("composer.teachTask"), icon: <GraduationCap size={16} />, onSelect: teachTask });
  if (goal) {
    items.push({
      key: "goal",
      label: t("composer.goal.chip"),
      icon: <Target size={16} />,
      active: goal.on,
      trailing: goal.on ? check : undefined,
      onSelect: goal.onToggle,
    });
  }
  if (approval) {
    const { current, note, items: choices } = approvalMenu(approval, false);
    const CurrentIcon = current.Icon;
    items.push({
      key: "approval",
      separatorBefore: true,
      label: t("composer.approval"),
      value: current.label,
      note,
      icon: <CurrentIcon size={16} />,
      onSelect: () => {},
      submenu: choices,
    });
  }
  if (placeItem) {
    const { subtitle, ...rest } = placeItem;
    items.push({ ...rest, value: subtitle });
  }
  return items;
}

function Tray({ items, active }: { items: SidebarMenuItem[]; active: boolean }) {
  return (
    <SidebarPopoverMenu
      items={items}
      ariaLabel={t("composer.tools")}
      triggerTitle={t("composer.tools")}
      anchorGap={18}
      triggerClassName={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
        active ? "text-accent hover:bg-control" : "text-ink-secondary hover:bg-control hover:text-ink",
      )}
      renderTrigger={({ open }) => (
        <Plus size={16} strokeWidth={1.75} absoluteStrokeWidth className={cn("transition-transform", open && "rotate-45")} aria-hidden="true" />
      )}
    />
  );
}

function TrayWithPlace({ place, ...rest }: TrayProps & { place: ComposerToolPlace }) {
  const placeItem = usePlaceMenuItem({ bot: place.bot, task: place.task, disabled: place.disabled, onPin: place.onPin });
  return <Tray items={toolItems({ ...rest, placeItem })} active={Boolean(rest.goal?.on)} />;
}

/** Fork: the Advanced composer's attach, teach, goal, approval and place buttons as one + menu; the submenus open beside it. */
export function ComposerToolTray(props: TrayProps) {
  if (props.place) return <TrayWithPlace {...props} place={props.place} />;
  return <Tray items={toolItems(props)} active={Boolean(props.goal?.on)} />;
}
