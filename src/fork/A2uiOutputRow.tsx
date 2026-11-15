import { useState } from "react";

import { SettingRow } from "@/components/SettingsPrimitives";
import { cn } from "@/lib/cn";
import { a2uiOutputMode } from "@/lib/feature-flags";
import { t } from "@/lib/i18n";
import { api, useStore, type ConfigStatus } from "@/state/store";

/** The segmented control the Look card's own rows use (Settings → Appearance, the light-or-dark row). */
const SEGMENTS = "inline-flex h-7 rounded-full bg-ink/[0.06] p-0.5";
const SEGMENT = "h-6 rounded-full px-2.5 text-[13px] transition-colors";

const MODES = [
  { value: "cards", label: "settings.a2uiOutput.cards" },
  { value: "markdown", label: "settings.a2uiOutput.markdown" },
  { value: "auto", label: "settings.a2uiOutput.auto" },
] as const;

/** Settings → Appearance → Chat: whether a plan or a choice arrives as an A2UI surface. */
export function A2uiOutputRow() {
  const { state, dispatch } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const mode = a2uiOutputMode(state.config);

  const choose = async (next: (typeof MODES)[number]["value"]) => {
    if (saving || next === mode) return;
    setSaving(true);
    setError("");
    try {
      const config: ConfigStatus = await api("/api/config", {
        method: "PATCH",
        body: JSON.stringify({ features: { a2uiOutput: next } }),
      });
      dispatch({ type: "configStatus", config });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("settings.a2uiOutput.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingRow
      title={t("settings.a2uiOutput.title")}
      subtitle={t("settings.a2uiOutput.subtitle")}
      message={error ? <span role="alert" className="text-danger">{error}</span> : undefined}
    >
      <div role="radiogroup" aria-label={t("settings.a2uiOutput.title")} className={SEGMENTS}>
        {MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={mode === option.value}
            data-a2ui-output={option.value}
            onClick={() => void choose(option.value)}
            className={cn(SEGMENT, mode === option.value ? "bg-ink/[0.12] text-ink" : "text-ink-secondary hover:text-ink")}
          >
            {t(option.label)}
          </button>
        ))}
      </div>
    </SettingRow>
  );
}
