import { createContext, useContext, type ReactNode } from "react";
import { RAIL_ACTIONS_IN_MENU } from "./ui-batch-1110b";

/** Simple's collapsed rail keeps only the bots and the avatar; inbox, search, new and plugins move into the
 * avatar's menu. The Sidebar owns those actions, so it hands them down here. */
export interface RailActions {
  onSearch: () => void;
  onNew: () => void;
  onPlugins: () => void;
}

const RailActionsContext = createContext<RailActions | null>(null);

export function RailActionsProvider({ actions, children }: { actions: RailActions; children: ReactNode }) {
  return <RailActionsContext.Provider value={actions}>{children}</RailActionsContext.Provider>;
}

export function useRailActions(): RailActions | null {
  return useContext(RailActionsContext);
}

export const RAIL_MENU_ACTIONS = RAIL_ACTIONS_IN_MENU;
