import { t } from "@/lib/i18n";
import { ActivitySection } from "../../ActivitySection";
import { AdminOnly } from "../../AdminOnly";
import { AttachmentStorageSettings } from "../../AttachmentStorageSettings";
import { AccessOverview } from "../../bot-access/AccessOverview";
import { CompanyBackupSettings } from "../../CompanyBackupSettings";
import { ImportSettings } from "../../ImportSettings";
import { PeopleSection } from "../../PeopleSection";
import { SettingsGroup, SettingsRows } from "../../SettingsPrimitives";
import { ThreadCleanupSettings } from "../../ThreadCleanupSettings";
import { UsageSection } from "../../UsageSection";
import { VaultSettings } from "../../VaultSettings";
import { WorkspaceBackupSettings } from "../../WorkspaceBackupSettings";
import { WorkspacesSection } from "../../WorkspacesSection";
import { useSettingsShell } from "../settings-shell";
import { MoveSection } from "./PlacePages";
import { PendingMovedNotice } from "@/fork/pending-moved";

export function VaultPage() {
  return <div data-settings-block="saved" className="flex flex-col gap-6"><VaultSettings /></div>;
}

export function SpendingPageContent() {
  return <div data-settings-block="summary" className="flex flex-col gap-6"><AdminOnly note="settings.adminOnly.usage"><UsageSection /></AdminOnly></div>;
}

/** Every row moved to Settings → 排查 → 待隐藏功能. */
export function SpendingPage() {
  return <PendingMovedNotice menu="settings.page.spending" />;
}

export function ImportExportPage() {
  return <AdminOnly>
    <WorkspaceBackupSettings layout={({ importRow, exportRow }) => <>
      <SettingsGroup label={t("settings.data.bringIn")} block="bring-in">
        <ImportSettings>{importRow}</ImportSettings>
      </SettingsGroup>
      <SettingsGroup label={t("settings.data.takeOut")} block="take-out">
        <SettingsRows>{exportRow}</SettingsRows>
        <CompanyBackupSettings />
      </SettingsGroup>
      <MoveSection />
    </>} />
  </AdminOnly>;
}

export function DataPageContent() {
  const { ctx } = useSettingsShell();
  return <>
    <SettingsGroup label={t("settings.data.storage")} block="storage">
      <SettingsRows><AttachmentStorageSettings /></SettingsRows>
    </SettingsGroup>
    {ctx.advanced && <ThreadCleanupSettings />}
    {!ctx.desktop && ctx.admin && <ActivitySection />}
  </>;
}

/** Every row moved to Settings → 排查 → 待隐藏功能. */
export function DataPage() {
  return <PendingMovedNotice menu="settings.page.data" />;
}

export function PeoplePage() {
  const { ctx } = useSettingsShell();
  return <>
    {!ctx.desktop && !ctx.cloud && <SettingsGroup label={t("settings.people.members")} block="members"><PeopleSection /></SettingsGroup>}
    {ctx.team && <SettingsGroup label={t("settings.section.botAccess")} block="bot-access"
      footnote={!ctx.desktop ? t("settings.people.activityIn") : undefined}><AccessOverview /></SettingsGroup>}
  </>;
}

export function InstallationsPage() {
  return <WorkspacesSection />;
}
