import { useState } from "react";

import { SettingRow, SettingsRows, Switch } from "@/components/SettingsPrimitives";
import { setAdvancedMode, useAdvancedMode } from "@/lib/interface-mode";
import { t } from "@/lib/i18n";

import { FORK_ADVANCED_UNLOCK, FORK_ADVANCED_UNLOCK_TAPS, setAdvancedUnlocked, useAdvancedUnlocked } from "./advanced-unlock";

/** Fork: the quiet spot under the updates page. Tap the app icon FORK_ADVANCED_UNLOCK_TAPS times and the Advanced
 * switch appears; switching it off hides it again, so Simple is always one tap away and nobody stumbles into it. */
export function ForkAdvancedUnlockRow() {
  const unlocked = useAdvancedUnlocked();
  const advanced = useAdvancedMode();
  const [taps, setTaps] = useState(0);
  if (!FORK_ADVANCED_UNLOCK) return null;

  if (!unlocked) {
    return (
      <button
        type="button"
        data-fork-unlock=""
        aria-label={t("settings.advancedMode.title")}
        className="mx-auto mt-10 mb-2 block size-8 cursor-default opacity-20 transition-opacity hover:opacity-35 focus:outline-none"
        onClick={() => {
          const next = taps + 1;
          if (next >= FORK_ADVANCED_UNLOCK_TAPS) {
            setTaps(0);
            setAdvancedUnlocked(true);
            return;
          }
          setTaps(next);
        }}
      >
        <img src="/app-icon.svg" alt="" width={32} height={32} className="size-8" draggable={false} />
      </button>
    );
  }

  return (
    <div data-fork-unlock-switch="" className="mt-8">
      <SettingsRows>
        <SettingRow title={t("settings.advancedMode.title")} subtitle={t("settings.simple.advancedMode")}>
          <Switch
            checked={advanced}
            aria-label={t("settings.advancedMode.title")}
            onClick={() => {
              if (advanced) {
                setAdvancedMode(false);
                setAdvancedUnlocked(false);
                setTaps(0);
                return;
              }
              setAdvancedMode(true);
            }}
          />
        </SettingRow>
      </SettingsRows>
    </div>
  );
}
