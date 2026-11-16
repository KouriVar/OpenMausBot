import { setMergedComposer, useMergedComposer } from "@/fork/composer-merge";
import { t } from "@/lib/i18n";
import { SettingRow, Switch } from "./SettingsPrimitives";

/** Settings → Appearance: the Advanced composer's tool buttons behind one + menu, on by default. */
export function MergedComposerRow() {
  const on = useMergedComposer();
  return (
    <SettingRow title={t("settings.mergedComposer.title")} subtitle={t("settings.mergedComposer.subtitle")}>
      <Switch checked={on} onClick={() => setMergedComposer(!on)} aria-label={t("settings.mergedComposer.title")} />
    </SettingRow>
  );
}
