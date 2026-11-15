import { Loader2 } from "lucide-react";

import { t } from "@/lib/i18n";
import type { AmbiguityStatus } from "@/hooks/use-ambiguity-marks";

/** The composer's quiet corner for the background pass: a spinner, then two seconds of "couldn't analyze". */
export function ComposerAnalysisStatus({ status }: { status: AmbiguityStatus }) {
  if (status === "idle") return null;
  return (
    <span data-composer-analysis-status role="status" className="flex shrink-0 items-center gap-1 px-1 text-[11px] leading-4 text-ink-tertiary">
      {status === "pending"
        ? <Loader2 aria-label={t("composer.ambiguity.working")} size={12} className="animate-spin" />
        : <span>{t("composer.ambiguity.failed")}</span>}
    </span>
  );
}
