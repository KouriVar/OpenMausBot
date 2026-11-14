import { SettingRow, Switch } from "@/components/SettingsPrimitives";
import { t } from "@/lib/i18n";

import { setBrandMark, useBrandMark } from "./brand-mark";

/** Settings → Appearance's "Show brand mark" switch: the Sully Coe wordmark at the top of the sidebar. */
export function BrandMarkRow() {
  const on = useBrandMark();
  return (
    <SettingRow title={t("settings.brandMark.title")} subtitle={t("settings.brandMark.subtitle")}>
      <Switch
        data-testid="fork-brand-mark"
        checked={on}
        onClick={() => setBrandMark(!on)}
        aria-label={t("settings.brandMark.title")}
      />
    </SettingRow>
  );
}
