import { useState } from "react";

import { SettingRow } from "@/components/SettingsPrimitives";
import { cn } from "@/lib/cn";
import { interactiveAnswersMode } from "@/lib/feature-flags";
import { t } from "@/lib/i18n";
import { api, useStore, type ConfigStatus } from "@/state/store";

/** The segmented control the Look card's own rows use (Settings → Appearance, the light-or-dark row). */
const SEGMENTS = "inline-flex h-7 rounded-full bg-ink/[0.06] p-0.5";
const SEGMENT = "h-6 rounded-full px-2.5 text-[13px] transition-colors";

const MODES = [
  { value: "off", label: "settings.interactiveAnswers.off" },
  { value: "widgets", label: "settings.interactiveAnswers.components" },
  { value: "widgets+html", label: "settings.interactiveAnswers.html" },
] as const;

/** Settings → Appearance → Chat: what a bot's reply may carry as components. */
export function InteractiveAnswersRow() {
  const { state, dispatch } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const mode = interactiveAnswersMode(state.config);

  const choose = async (next: (typeof MODES)[number]["value"]) => {
    if (saving || next === mode) return;
    setSaving(true);
    setError("");
    try {
      const config: ConfigStatus = await api("/api/config", {
        method: "PATCH",
        body: JSON.stringify({ features: { interactiveAnswers: next } }),
      });
      dispatch({ type: "configStatus", config });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("settings.interactiveAnswers.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingRow
      title={t("settings.interactiveAnswers.title")}
      subtitle={t("settings.interactiveAnswers.subtitle")}
      message={error ? <span role="alert" className="text-danger">{error}</span> : undefined}
    >
      <div role="radiogroup" aria-label={t("settings.interactiveAnswers.title")} className={SEGMENTS}>
        {MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={mode === option.value}
            data-interactive-answers={option.value}
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
