import { useRef } from "react";

import { cn } from "@/lib/cn";
import type { SidebarDensity } from "@/lib/sidebar-preferences";
import { useStore } from "@/state/store";
import type { ReactNode } from "react";
import { FOOTER_ACTIONS } from "@/fork/ui-batch-1110b";

import { AccountMoveStatus, useAccountMoveLine } from "./AccountMove";
import { CloudRoomCard } from "./CloudRoomCard";
import { CloudUsageCard } from "./CloudUsageMeter";
import { endCloudHowTo, useWorkspacePlace, type WorkspacePlace } from "./DesktopWorkspaceSwitcher";
import { SidebarConnectApps } from "./SidebarConnectApps";
import { SidebarBottomButtons, SidebarFooterNav } from "./SidebarFooterNav";
import { phoneSettingsAction, SidebarPhoneButton } from "./SidebarPhoneButton";
import { SidebarProfileMenu, useSimpleAccount, type ArchivedBots } from "./SidebarProfileMenu";
import { UpdateIndicator } from "./UpdateIndicator";

export function useSimplePlace(): WorkspacePlace {
  const { state, dispatch } = useStore();
  return useWorkspacePlace({ cloudHome: state.config?.cloudHome === true, howTo: state.cloudHowTo, onMenuClosed: () => endCloudHowTo(dispatch) });
}

export function SidebarPlaceStatus({ place, className }: { place: WorkspacePlace; className?: string }) {
  if (place.error) return <p role="alert" className={cn("text-[12px] text-danger", className)}>{place.error}</p>;
  if (place.waking) return <p role="status" data-cloud-waking className={cn("text-[12px] text-ink-secondary", className)}>{place.waking}</p>;
  return null;
}

function SimpleSidebarFooter({ owner, archived, actions }: { owner: string | null; archived?: ArchivedBots; actions?: ReactNode }) {
  const { state } = useStore();
  const place = useSimplePlace();
  const account = useSimpleAccount(place, owner, archived);
  const move = useAccountMoveLine(state.config?.cloudHome === true);
  const footer = useRef<HTMLDivElement>(null);
  // The move's words open the account menu just below them, where the move's row is.
  const openAccount = () => footer.current?.querySelector("[data-sidebar-account]")?.closest("button")?.click();
  return (
    <div ref={footer} data-sidebar-footer="simple" className="px-4 pb-4 pt-2">
      <CloudRoomCard />
      <CloudUsageCard />
      <SidebarPlaceStatus place={place} className="mb-2 px-1" />
      <AccountMoveStatus kind={move.kind} place={move.place} retry={move.retry} onOpen={openAccount} className="ps-1" />
      <div className="flex items-center gap-2 not-first:mt-2">
        <SidebarProfileMenu simple={account} />
        {!FOOTER_ACTIONS && <SidebarConnectApps />}
        <UpdateIndicator className="size-9" />
        {actions && <div data-simple-footer-actions className="ms-auto flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function SidebarFooter({ density, simple = false, owner = null, archived, toolsCollapsed, onToggleTools, footerActions }: {
  density: SidebarDensity;
  simple?: boolean;
  owner?: string | null;
  archived?: ArchivedBots;
  toolsCollapsed: boolean;
  onToggleTools?: () => void;
  /** Simple's collapsed footer row: search, inbox and + sit on the account's own row. */
  footerActions?: ReactNode;
}) {
  const { dispatch } = useStore();
  if (simple) return <SimpleSidebarFooter owner={owner} archived={archived} actions={footerActions} />;
  return (
    <div className={cn("pb-3 pt-2", density === "icons" ? "flex flex-col items-center gap-1 px-2" : "px-3")}>
      <SidebarFooterNav density={density} collapsed={toolsCollapsed} onToggleCollapsed={onToggleTools} />
      {density === "icons" ? (
        <>
          <SidebarPhoneButton density={density} onOpen={() => dispatch(phoneSettingsAction())} />
          <div className="flex flex-col items-center justify-center gap-1">
            <UpdateIndicator />
            <SidebarProfileMenu iconOnly />
          </div>
        </>
      ) : (
        <>
          <CloudRoomCard />
          <CloudUsageCard />
          <div className="flex items-center gap-1 not-first:mt-3">
            <div className="min-w-0 flex-1">
              <SidebarProfileMenu />
            </div>
            <SidebarBottomButtons />
          </div>
        </>
      )}
    </div>
  );
}
