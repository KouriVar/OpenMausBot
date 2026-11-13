import { ArrowUpRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { CLOUD_PLAN_URL } from "@/lib/app-links";
import { CloudAccountSettings } from "../../CloudAccountSettings";
import { useStore } from "@/state/store";
import { productName } from "@/lib/brand";
import { SettingRow, SettingsGroup, SettingsRows } from "../../SettingsPrimitives";
import { useCloudUsageSettings } from "../../CloudUsageMeter";
import { SpentRow } from "../plan-parts";
import { useSettingsShell } from "../settings-shell";

export function PlanPage() {
  const { ctx, place } = useSettingsShell();
  const { state, dispatch } = useStore();
  const { usage, upgrade, dialog } = useCloudUsageSettings();
  if (!ctx.desktop) {
    return (
      <SettingsGroup block="plan">
        <SettingsRows>
          <SettingRow title={t("settings.plan.browserTitle")} subtitle={t("settings.plan.browserLine", { app: productName() })}>
            <a className="ui-button ui-button-primary inline-flex items-center gap-1" href={CLOUD_PLAN_URL} target="_blank" rel="noreferrer">{t("settings.plan.openBilling")}<ArrowUpRight size={12} aria-hidden="true" /></a>
          </SettingRow>
        </SettingsRows>
      </SettingsGroup>
    );
  }
  return <>
    <CloudAccountSettings part="plan" advanced={ctx.advanced} cloudHome={ctx.cloud} teamHome={state.config?.team} linkRequest={state.appSettingsCloudLink}
      usage={usage} upgrade={upgrade}
      // A Cloud's own cost stays off its paid plan's card (§1.3: it must never read as a second bill).
      extra={!ctx.advanced && !ctx.client && !(ctx.team && !ctx.admin) && (place.kind === "computer" || place.kind === "server") ? <SpentRow place={place.name} /> : undefined}
      onAddCloud={() => dispatch({ type: "openCloudAdd", source: "app_settings" })}
      onSignIn={() => dispatch({ type: "openCloudAdd", source: "app_settings", signIn: true })} />
    {dialog}
  </>;
}
