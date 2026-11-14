import { SettingRow, Switch } from "@/components/SettingsPrimitives";
import { t } from "@/lib/i18n";

import { setMarkAmbiguity, useMarkAmbiguity } from "./mark-ambiguity";

/** Settings → General → Typing: underline words the fast model finds ambiguous before the message is sent. */
export function MarkAmbiguityRow() {
  const on = useMarkAmbiguity();
  return (
    <SettingRow title={t("settings.markAmbiguity.title")} subtitle={t("settings.markAmbiguity.subtitle")}>
      <Switch
        data-testid="fork-mark-ambiguity"
        checked={on}
        onClick={() => setMarkAmbiguity(!on)}
        aria-label={t("settings.markAmbiguity.title")}
      />
    </SettingRow>
  );
}
