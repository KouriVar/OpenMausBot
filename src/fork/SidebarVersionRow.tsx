import { SettingRow, Switch } from "@/components/SettingsPrimitives";
import { t } from "@/lib/i18n";

import { setSidebarVersion, useSidebarVersion } from "./sidebar-version";

/** Settings → This app's "Show version in sidebar" switch: the account menu's "MausBot V0.8.x" line. */
export function SidebarVersionRow() {
  const on = useSidebarVersion();
  return (
    <SettingRow title={t("settings.sidebarVersion.title")} subtitle={t("settings.sidebarVersion.subtitle")}>
      <Switch
        data-testid="fork-sidebar-version"
        checked={on}
        onClick={() => setSidebarVersion(!on)}
        aria-label={t("settings.sidebarVersion.title")}
      />
    </SettingRow>
  );
}
