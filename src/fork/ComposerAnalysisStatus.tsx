import { Loader2 } from "lucide-react";

import { t } from "@/lib/i18n";
import type { AmbiguityFailure, AmbiguityStatus } from "@/hooks/use-ambiguity-marks";

/** The composer's quiet corner for the background pass: a spinner, then two seconds of "couldn't analyze". */
export function ComposerAnalysisStatus({ status, failure }: { status: AmbiguityStatus; failure?: AmbiguityFailure }) {
  if (status === "idle") return null;
  if (status === "pending") {
    return (
      <span data-composer-analysis-status role="status" className="flex shrink-0 items-center gap-1 px-1 text-[11px] leading-4 text-ink-tertiary">
        <Loader2 aria-label={t("composer.ambiguity.working")} size={12} className="animate-spin" />
      </span>
    );
  }
  const detail = failure === "timeout" ? t("composer.ambiguity.failed.timeout") : t("composer.ambiguity.failed.error");
  return (
    <span data-composer-analysis-status role="status" title={detail} className="flex shrink-0 items-center gap-1 px-1 text-[11px] leading-4 text-ink-tertiary">
      <span title={detail}>{t("composer.ambiguity.failed")}</span>
    </span>
  );
}
