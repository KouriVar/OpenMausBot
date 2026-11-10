import { SettingRow, Switch } from "@/components/SettingsPrimitives";
import { t } from "@/lib/i18n";
import { FORK_UI_1110, useBoldText } from "./ui-batch-1110";

/** Settings → Appearance's "Bold text" switch: one weight heavier in the chat's messages and the composer. */
export function ForkBoldTextRow() {
  const [on, choose] = useBoldText();
  if (!FORK_UI_1110) return null;
  return (
    <SettingRow title={t("settings.boldText.title")} subtitle={t("settings.boldText.subtitle")}>
      <Switch
        data-testid="fork-bold-text"
        checked={on}
        onClick={() => choose(!on)}
        aria-label={t("settings.boldText.title")}
      />
    </SettingRow>
  );
}
