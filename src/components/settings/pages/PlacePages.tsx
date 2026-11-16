import { useState } from "react";
import { t } from "@/lib/i18n";
import { productName } from "@/lib/brand";
import { skillsLibraryEnabled } from "@/lib/feature-flags";
import { useStore } from "@/state/store";
import { AdminOnly } from "../../AdminOnly";
import { AutomaticRecoverySettings } from "../../AutomaticRecoverySettings";
import { AwayEmailsSetting } from "../../AwayEmailsSetting";
import { PausedBotsButton } from "../../AwakeBotsPicker";
import { BrowserProxyRow, BuiltInBrowserRow, NewBrowserSettings, ServerSitesRow } from "../../BrowserSettingsRows";
import { CacheKeepWarmSettings } from "../../CacheKeepWarmSettings";
import { CloudKeepHere } from "../../CloudKeepHere";
import { DecisionModelSettings } from "../../DecisionModelSettings";
import { EnginesSettings } from "../../EnginesSettings";
import { LocalComputerSection } from "../../LocalComputerSection";
import { McpCallTimeoutSettings } from "../../McpCallTimeoutSettings";
import { DefaultBotSettings } from "../../NewBotDialog";
import { ProfileFields } from "../../ProfileSettings";
import { RoomTurnTimeoutSettings } from "../../RoomTurnTimeoutSettings";
import { SavedStepsRow } from "../../SavedStepsRow";
import { Card, SettingRow, SettingsDisclosureRow, SettingsFoldRow, SettingsGroup, SettingsRows } from "../../SettingsPrimitives";
import { KEY_SECTIONS } from "../../keys/key-catalog";
import { DesktopKinds } from "../DesktopKinds";
import { AnalysisModelRow } from "@/fork/AnalysisModelRow";
import { SkillsSection } from "../../SkillsSection";
import { ThreadConcurrencySettings } from "../../ThreadConcurrencySettings";
import { KeysPage } from "../../keys/KeysPage";
import { BrowserProfilesRow, ExperimentalFeaturesRow, NewBotEffortRow } from "../../AppSettingsRows";
import { useSettingsShell } from "../settings-shell";
import { AdvancedSection } from "../AdvancedSection";

export function AiPage() {
  const { ctx, anchor } = useSettingsShell();
  const [more, setMore] = useState(false);
  // Simple ends after Providers: Other services is one closed fold row, so the page fits one window.
  const [services, setServices] = useState(ctx.advanced || anchor === "ai-keys");
  // A key asked for by search or a link opens Other services whatever the fold says.
  const shown = ctx.advanced || services || anchor === "ai-keys";
  const count = KEY_SECTIONS.filter((section) => section.id !== "ai").length;
  return <>
    <AdminOnly>
      <div data-settings-block="providers" className="flex scroll-mt-4 flex-col gap-6">
        <EnginesSettings simple more={{ id: "ai-more", open: more, onToggle: () => setMore((open) => !open) }} />
      </div>
      <SettingsGroup label={t("settings.analysisModel.group")} block="analysis">
        <SettingsRows><AnalysisModelRow /></SettingsRows>
      </SettingsGroup>
      {!ctx.advanced && (
        <SettingsGroup block="ai-keys-fold">
          <SettingsRows>
            <SettingsFoldRow id="ai-other-services" title={t("settings.ai.otherServices")} value={String(count)} open={shown} onToggle={() => setServices(!shown)} />
          </SettingsRows>
        </SettingsGroup>
      )}
      {shown && (
        <SettingsGroup label={ctx.advanced ? t("settings.ai.otherServices") : undefined} block="ai-keys">
          <KeysPage bare exclude={anchor === "ai-keys" ? [] : ["ai"]} />
        </SettingsGroup>
      )}
      <AdvancedSection anchor="backup-model"><SettingsGroup label={t("settings.ai.backupModel")} block="backup-model"><AutomaticRecoverySettings /></SettingsGroup></AdvancedSection>
      <AdvancedSection anchor="routing"><DecisionModelSettings /></AdvancedSection>
    </AdminOnly>
  </>;
}

export function BotsPage() {
  const { ctx } = useSettingsShell();
  const { state } = useStore();
  const paused = (state.config?.pausedBots?.length ?? 0) > 0;
  return <>
    {paused && <SettingsGroup block="awake"><SettingsRows><SettingRow title={t("settings.bots.awakeTitle")} subtitle={t("settings.bots.awakeLine")}><PausedBotsButton /></SettingRow></SettingsRows></SettingsGroup>}
    <SettingsGroup label={t("settings.bots.aboutYou")} block="about-you"
      footnote={ctx.here || !ctx.desktop ? t("settings.bots.aboutYouHome", { app: productName() }) : undefined}>
      <div className="flex flex-col gap-2">
        <Card><ProfileFields /></Card>
        <SettingsRows><AwayEmailsSetting row /></SettingsRows>
      </div>
    </SettingsGroup>
    <SettingsGroup label={t("settings.bots.newBots")} block="new-bots">
      <SettingsRows><NewBotEffortRow /><DefaultBotSettings simple /></SettingsRows>
    </SettingsGroup>
    {!(ctx.team && !ctx.admin) && <AdvancedSection anchor="limits" also={["parallel", "group-turns", "tool-time", "keep-warm"]}><SettingsGroup label={t("settings.simple.more.limits")} block="limits">
      <SettingsRows selectWidth={160}>
        <div data-settings-block="group-turns" className="contents"><RoomTurnTimeoutSettings /></div>
        <div data-settings-block="tool-time" className="contents"><McpCallTimeoutSettings /></div>
        <ThreadConcurrencySettings />
        <div data-settings-block="keep-warm" className="contents"><CacheKeepWarmSettings /></div>
      </SettingsRows>
    </SettingsGroup></AdvancedSection>}
    {skillsLibraryEnabled(state.config) && <div data-settings-block="skills"><SkillsSection /></div>}
    <AdvancedSection anchor="early"><div data-settings-block="early"><ExperimentalFeaturesRow /></div></AdvancedSection>
  </>;
}

export function DesktopsPage() {
  const { ctx, anchor } = useSettingsShell();
  const [details, setDetails] = useState(anchor === "desktop-details");
  return <>
    <SettingsGroup label={t("settings.desktops.browserSection")} block="browser">
      <SettingsRows><BuiltInBrowserRow /><ServerSitesRow /><BrowserProxyRow />{ctx.advanced && <div data-settings-block="new-browser" className="contents"><NewBrowserSettings /></div>}</SettingsRows>
    </SettingsGroup>
    <AdminOnly><DesktopKinds /></AdminOnly>
    <BrowserProfilesRow />
    {ctx.advanced && (
      <AdminOnly>
        <SettingsDisclosureRow id="desktop-details" block="desktop-details" title={t("settings.desktops.detailsTitle")} subtitle={t("settings.desktops.detailsLine")}
          open={details} onToggle={() => setDetails((open) => !open)}>
          <div className="flex flex-col gap-6 px-4 py-4"><LocalComputerSection /></div>
        </SettingsDisclosureRow>
      </AdminOnly>
    )}
    <AdvancedSection anchor="automation"><SettingsGroup label={t("settings.desktops.automation")} block="automation"><SettingsRows><SavedStepsRow /></SettingsRows></SettingsGroup></AdvancedSection>
  </>;
}

export function MoveSection() {
  const { ctx } = useSettingsShell();
  if (!ctx.here || !window.ogb?.cloudSendPage) return null;
  return <CloudKeepHere bridge={window.ogb.cloudSendPage} />;
}
