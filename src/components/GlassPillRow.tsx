import { SettingRow, Switch } from "./SettingsPrimitives";
import { t } from "@/lib/i18n";
import { setGlassPill, useGlassPill } from "@/fork/glass/GlassSurface";

/** Settings → Appearance: the chat head's liquid glass, on by default; off restores the flat pill. */
export function GlassPillRow() {
  const on = useGlassPill();
  return (
    <SettingRow title={t("settings.glassPill.title")} subtitle={t("settings.glassPill.subtitle")}>
      <Switch checked={on} onClick={() => setGlassPill(!on)} aria-label={t("settings.glassPill.title")} />
    </SettingRow>
  );
}
