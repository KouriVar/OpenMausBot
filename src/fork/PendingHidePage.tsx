import { t } from "@/lib/i18n";
import type { LocaleKey } from "@/locales";
import { useStore } from "@/state/store";
import { skillsLibraryEnabled } from "@/lib/feature-flags";
import { SettingsGroup, SettingRow, SettingsRows, Switch } from "@/components/SettingsPrimitives";
import { useSettingsShell } from "@/components/settings/settings-shell";
import { AnalyticsRow } from "@/components/AnalyticsRow";
import { AutomaticRecoverySettings } from "@/components/AutomaticRecoverySettings";
import { AwayEmailsSetting } from "@/components/AwayEmailsSetting";
import { BrowserProfilesRow } from "@/components/AppSettingsRows";
import { BrowserProxyRow } from "@/components/BrowserSettingsRows";
import { CacheKeepWarmSettings } from "@/components/CacheKeepWarmSettings";
import { ClaudeBedrockEndpoints } from "@/components/ClaudeBedrock";
import { DecisionModelSettings } from "@/components/DecisionModelSettings";
import { GrokImportSection } from "@/components/ImportSettings";
import { ImageGenerationSettings } from "@/components/ImageGenerationSettings";
import { LearnedSkillsSettings } from "@/components/ShareLearnedSkillsSettings";
import { ServerUpdateRow } from "@/components/ServerUpdateRow";
import { ThreadConcurrencySettings } from "@/components/ThreadConcurrencySettings";
import { DataPageContent, SpendingPageContent } from "@/components/settings/pages/DataPages";
import { PhonePageContent } from "@/components/settings/pages/PhonePage";
import { DesktopDetailsRow } from "@/components/settings/pages/PlacePages";
import { DesktopKinds } from "@/components/settings/DesktopKinds";
import { versionLine } from "@/components/settings/settings-context";
import {
  PENDING_AREAS, PENDING_ENTRIES, PendingSource, setPendingHideOn, usePendingHideCounts, usePendingHideOn,
  type PendingHideId,
} from "@/fork/pending-hide";

/** "原菜单 · 原分组 · ", from strings the app already has. */
function source(menu: LocaleKey, group?: LocaleKey): string {
  return [t(menu), group ? t(group) : null].filter(Boolean).join(" · ") + " · ";
}

function PendingSwitch({ id }: { id: PendingHideId }) {
  const on = usePendingHideOn(id);
  const label = t(PENDING_ENTRIES.find((entry) => entry.id === id)!.labelKey);
  return <Switch checked={on} aria-label={label} onClick={() => setPendingHideOn(id, !on)} />;
}

/** Settings → 排查 → 待隐藏功能: rows moved from their old pages, and one switch per entry outside Settings. */
export function PendingHidePage() {
  const { ctx, place } = useSettingsShell();
  const { state } = useStore();
  const counts = usePendingHideCounts();
  const team = state.config?.team;
  const movedWhole = <span data-pending-moved-whole="" className="text-[11px] leading-4 text-ink-tertiary">{t("pending.movedWhole")}</span>;

  return (
    <>
      <p data-pending-summary="" className="px-4 text-[12px] leading-4 text-ink-secondary">
        {t("pending.summary", { total: counts.total, off: counts.off })}
      </p>

      <div data-pending-section="moved" className="flex flex-col gap-6">
        <div className="px-4 text-[12px] font-medium leading-4 text-ink-tertiary">{t("pending.section.settings")}</div>

        <SettingsGroup label={t("settings.page.desktops")}>
          <PendingSource.Provider value={source("settings.page.desktops", "settings.profiles.title")}>
            <BrowserProfilesRow />
          </PendingSource.Provider>
          <PendingSource.Provider value={source("settings.page.desktops", "settings.desktops.browserSection")}>
            <SettingsRows><BrowserProxyRow /></SettingsRows>
          </PendingSource.Provider>
          <PendingSource.Provider value={source("settings.page.desktops", "settings.desktops.kinds")}>
            <DesktopKinds only={["cloud", "servers"]} />
            <DesktopDetailsRow />
          </PendingSource.Provider>
        </SettingsGroup>

        <SettingsGroup label={t("settings.section.phoneDevices")} actions={movedWhole}>
          <PendingSource.Provider value={source("settings.section.phoneDevices")}>
            <PhonePageContent />
          </PendingSource.Provider>
        </SettingsGroup>

        <SettingsGroup label={t("settings.page.data")} actions={movedWhole}>
          <PendingSource.Provider value={source("settings.page.data")}>
            <DataPageContent />
          </PendingSource.Provider>
        </SettingsGroup>

        <SettingsGroup label={t("settings.page.spending")} actions={movedWhole}>
          <PendingSource.Provider value={source("settings.page.spending")}>
            <SpendingPageContent />
          </PendingSource.Provider>
        </SettingsGroup>

        <SettingsGroup label={t("settings.group.ai")}>
          <PendingSource.Provider value={source("settings.group.ai")}>
            <AutomaticRecoverySettings />
            <DecisionModelSettings />
            <ImageGenerationSettings />
            <SettingsRows><div className="p-4"><ClaudeBedrockEndpoints /></div></SettingsRows>
          </PendingSource.Provider>
        </SettingsGroup>

        <SettingsGroup label={t("settings.page.bots")}>
          <PendingSource.Provider value={source("settings.page.bots")}>
            {team && <SettingsRows><AwayEmailsSetting row /></SettingsRows>}
            <SettingsRows><ThreadConcurrencySettings /></SettingsRows>
            <CacheKeepWarmSettings />
            {skillsLibraryEnabled(state.config) && <SettingsRows><LearnedSkillsSettings /></SettingsRows>}
          </PendingSource.Provider>
        </SettingsGroup>

        <SettingsGroup label={t("settings.section.general")}>
          <PendingSource.Provider value={source("settings.section.general", "settings.general.privacy")}>
            <SettingsRows><AnalyticsRow simple /></SettingsRows>
          </PendingSource.Provider>
        </SettingsGroup>

        <SettingsGroup label={t("settings.page.importExport")}>
          <PendingSource.Provider value={source("settings.page.importExport", "settings.data.bringIn")}>
            <SettingsRows><GrokImportSection /></SettingsRows>
          </PendingSource.Provider>
        </SettingsGroup>

        {place.kind === "server" && !ctx.client && !window.ogb?.updater && (
          <SettingsGroup label={t("settings.page.app")} block="pending-app">
            <PendingSource.Provider value={source("settings.page.app", "settings.updates.title")}>
              <SettingsRows><ServerUpdateRow title={versionLine()} /></SettingsRows>
            </PendingSource.Provider>
          </SettingsGroup>
        )}
      </div>

      <div data-pending-section="entries" className="flex flex-col gap-6">
        <div className="px-4 text-[12px] font-medium leading-4 text-ink-tertiary">{t("pending.section.entries")}</div>
        {PENDING_AREAS.map((area) => {
          const entries = PENDING_ENTRIES.filter((entry) => entry.area === area.id);
          if (entries.length === 0) return null;
          return (
            <SettingsGroup key={area.id} label={t(area.labelKey)} block={`pending-${area.id}`}>
              <SettingsRows>
                {entries.map((entry) => (
                  <SettingRow key={entry.id} title={`${t(area.labelKey)} · ${t(entry.labelKey)}`}>
                    <PendingSwitch id={entry.id} />
                  </SettingRow>
                ))}
              </SettingsRows>
            </SettingsGroup>
          );
        })}
      </div>
    </>
  );
}
