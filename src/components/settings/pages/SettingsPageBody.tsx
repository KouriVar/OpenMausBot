import type { SettingsPageId } from "../settings-index";
import { AccountPage, PlanPage } from "./AccountPages";
import { AppPage, AppearancePage, GeneralPage } from "./AppPages";
import { DataPage, InstallationsPage, PeoplePage, SpendingPage, VaultPage } from "./DataPages";
import { AiPage, BotsPage, DesktopsPage } from "./PlacePages";
import { ConnectorsPage } from "./ConnectorsPage";

const PAGES: Record<SettingsPageId, () => React.ReactNode> = {
  phone: () => null,
  ai: AiPage,
  bots: BotsPage,
  desktops: DesktopsPage,
  vault: VaultPage,
  usage: SpendingPage,
  transfer: () => null,
  data: DataPage,
  people: PeoplePage,
  installations: InstallationsPage,
  account: AccountPage,
  plan: PlanPage,
  app: AppPage,
  general: GeneralPage,
  appearance: AppearancePage,
  connectors: ConnectorsPage,
};

export function SettingsPageBody({ page }: { page: SettingsPageId }) {
  const Page = PAGES[page];
  return <Page />;
}
