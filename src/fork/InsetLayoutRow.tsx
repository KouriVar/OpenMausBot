import { SettingRow } from "@/components/SettingsPrimitives";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";

import { APP_LAYOUTS, useInsetLayout } from "./inset-layout";

/** The segmented control the Look card's own rows use (Settings → Appearance, the light-or-dark row). */
const SEGMENTS = "inline-flex h-7 rounded-full bg-ink/[0.06] p-0.5";
const SEGMENT = "h-6 rounded-full px-2.5 text-[13px] transition-colors";

/** Settings → Appearance → Look: Classic or Inset, and one quiet line saying what Inset is. */
export function InsetLayoutRow() {
  const { layout, choose } = useInsetLayout();
  return (
    <>
      <SettingRow title={t("settings.insetLayout.title")}>
        <div role="radiogroup" aria-label={t("settings.insetLayout.title")} className={SEGMENTS}>
          {APP_LAYOUTS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={layout === value}
              data-app-layout={value}
              onClick={() => choose(value)}
              className={cn(SEGMENT, layout === value ? "bg-ink/[0.12] text-ink" : "text-ink-secondary hover:text-ink")}
            >
              {t(value === "classic" ? "settings.insetLayout.classic" : "settings.insetLayout.inset")}
            </button>
          ))}
        </div>
      </SettingRow>
      <div data-settings-hint className="px-4 py-2 text-[12px] leading-4 text-ink-secondary">{t("settings.insetLayout.note")}</div>
    </>
  );
}
