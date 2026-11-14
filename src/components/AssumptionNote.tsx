import { t } from "@/lib/i18n";
import type { Assumption } from "../../shared/assumptions";

/** The quiet line under a sent message: what its ambiguous words were taken to mean. */
export function AssumptionNote({ assumptions }: { assumptions: readonly Assumption[] }) {
  if (!assumptions.length) return null;
  return (
    <details data-assumption-note="" className="mt-1 text-[11px] leading-4 text-ink-tertiary">
      <summary className="cursor-pointer select-none hover:text-ink-secondary">{t("chat.assumptions.summary", { count: assumptions.length })}</summary>
      <ul className="mt-1 flex flex-col gap-0.5 ps-3">
        {assumptions.map((assumption) => (
          <li key={assumption.word} className="list-disc">
            <bdi dir="auto" className="font-medium">{assumption.word}</bdi>
            <span className="text-ink-tertiary"> · </span>
            <bdi dir="auto">{assumption.meaning}</bdi>
          </li>
        ))}
      </ul>
    </details>
  );
}
