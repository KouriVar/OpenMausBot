import { SettingRow, Switch } from "@/components/SettingsPrimitives";
import { t } from "@/lib/i18n";

import { useSidebarVibrancy } from "./sidebar-vibrancy";

/** Settings → Appearance → Look: the sidebar's system vibrancy. A Mac only row; elsewhere it does not exist. */
export function SidebarVibrancyRow() {
  const { available, on, choose } = useSidebarVibrancy();
  if (!available) return null;
  return (
    <SettingRow title={t("settings.sidebarVibrancy.title")} subtitle={t("settings.sidebarVibrancy.subtitle")}>
      <Switch
        data-testid="fork-sidebar-vibrancy"
        checked={on}
        onClick={() => choose(!on)}
        aria-label={t("settings.sidebarVibrancy.title")}
      />
    </SettingRow>
  );
}
