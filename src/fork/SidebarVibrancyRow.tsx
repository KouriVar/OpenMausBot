import { SettingRow, Switch } from "@/components/SettingsPrimitives";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";

import { GLASS_OVERLAYS, GLASS_TRANSPARENCY, useSidebarVibrancy } from "./sidebar-vibrancy";

/** The segmented control the Look card's own rows use (Settings → Appearance, the light-or-dark row). */
const SEGMENTS = "inline-flex h-7 rounded-full bg-ink/[0.06] p-0.5";
const SEGMENT = "h-6 rounded-full px-2.5 text-[13px] transition-colors";

/**
 * Settings → Appearance → Look: the sidebar's system vibrancy and, while it is on, how much of the wallpaper shows and
 * which colour is laid over it. A Mac only group; elsewhere it does not exist.
 */
export function SidebarVibrancyRow() {
  const { available, on, choose, transparency, setTransparency, overlay, setOverlay } = useSidebarVibrancy();
  if (!available) return null;
  return (
    <>
      <SettingRow title={t("settings.sidebarVibrancy.title")} subtitle={t("settings.sidebarVibrancy.subtitle")}>
        <Switch
          data-testid="fork-sidebar-vibrancy"
          checked={on}
          onClick={() => choose(!on)}
          aria-label={t("settings.sidebarVibrancy.title")}
        />
      </SettingRow>
      {on && (
        <SettingRow title={t("settings.sidebarVibrancy.glass.title")} subtitle={t("settings.sidebarVibrancy.glass.subtitle")}>
          <div role="radiogroup" aria-label={t("settings.sidebarVibrancy.glass.title")} className={SEGMENTS}>
            {GLASS_TRANSPARENCY.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={transparency === value}
                data-glass-transparency={value}
                onClick={() => setTransparency(value)}
                className={cn(SEGMENT, transparency === value ? "bg-ink/[0.12] text-ink" : "text-ink-secondary hover:text-ink")}
              >
                {value}%
              </button>
            ))}
          </div>
        </SettingRow>
      )}
      {on && (
        <SettingRow title={t("settings.sidebarVibrancy.overlay.title")} subtitle={t("settings.sidebarVibrancy.overlay.subtitle")}>
          <div role="radiogroup" aria-label={t("settings.sidebarVibrancy.overlay.title")} className={SEGMENTS}>
            {GLASS_OVERLAYS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={overlay === value}
                data-glass-overlay={value}
                onClick={() => setOverlay(value)}
                className={cn(SEGMENT, overlay === value ? "bg-ink/[0.12] text-ink" : "text-ink-secondary hover:text-ink")}
              >
                {t(value === "auto" ? "settings.sidebarVibrancy.overlay.auto" : value === "light" ? "settings.sidebarVibrancy.overlay.light" : "settings.sidebarVibrancy.overlay.dark")}
              </button>
            ))}
          </div>
        </SettingRow>
      )}
    </>
  );
}
