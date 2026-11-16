import { t } from "@/lib/i18n";
import type { LocaleKey } from "@/locales";
import { useSettingsShell } from "@/components/settings/settings-shell";
import { SettingsLinkRow, SettingsRows } from "@/components/SettingsPrimitives";

/** A page whose every row moved to the pending page, reached by an old deep link or search hit. */
export function PendingMovedNotice({ menu }: { menu: LocaleKey }) {
  const { go } = useSettingsShell();
  return (
    <SettingsRows>
      <SettingsLinkRow
        title={t("pending.movedNotice", { menu: t(menu) })}
        subtitle={t("pending.movedNoticeLine")}
        onClick={() => go("pending")}
        data={{ "data-pending-moved": "" }}
      />
    </SettingsRows>
  );
}
