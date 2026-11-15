import { t } from "@/lib/i18n";
import { desktopAppVersion } from "@/lib/app-links";
import { versionLine, type SettingsPlace } from "./settings-context";

export function overviewStatus(place: SettingsPlace): string {
  if (place.kind === "computer") return `${versionLine(desktopAppVersion())} · ${t("settings.overview.updatesWithApp")}`;
  return `${place.kind === "server" ? t("settings.place.running") : t("settings.place.alwaysOn")} · ${versionLine()}`;
}
