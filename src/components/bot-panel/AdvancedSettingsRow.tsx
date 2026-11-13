import { SlidersHorizontal } from "lucide-react";

import { FORK_ADVANCED_UNLOCK, readAdvancedUnlocked } from "@/fork/advanced-unlock";
import { t } from "@/lib/i18n";
import { setAdvancedMode, useAdvancedMode } from "@/lib/interface-mode";
import { SIMPLE_ONLY } from "@/lib/simple-only";
import { useStore } from "@/state/store";
import { Card, NavRow } from "./rows";

/** Simple mode leaves out Sending on your behalf and per-app Access; this row says they exist. With Advanced mode in
 * reach it opens them there, and while the mode still sits behind the app icon on This app it opens that page, which
 * is the one place the switch can appear. Advanced unreachable for good: no row. */
export function AdvancedSettingsRow() {
  const { dispatch } = useStore();
  const advanced = useAdvancedMode();
  if (SIMPLE_ONLY && !FORK_ADVANCED_UNLOCK) return null;
  const open = () => {
    if (!SIMPLE_ONLY || (advanced && readAdvancedUnlocked())) {
      setAdvancedMode(true);
      dispatch({ type: "toggleSettings", open: true, section: "permissions" });
      return;
    }
    dispatch({ type: "toggleAppSettings", open: true, section: "app" });
  };
  return (
    <Card anchor="advanced">
      <NavRow data-panel-row="advanced" icon={SlidersHorizontal} title={t("botPanel.advanced.title")} hint={t("botPanel.advanced.hint")} onClick={open} />
    </Card>
  );
}
