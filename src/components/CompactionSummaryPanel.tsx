import { currentTaskBot, useStore, visibleMessages, type Bot } from "@/state/store";
import { t } from "@/lib/i18n";
import { EXCERPT_SUMMARY_HEADER } from "../../shared/wire";

/** The side panel's page for the run's own context summary: the newest one in this conversation, which the server
 * rewrites each time it compacts, so the page follows the conversation without a reload. */
export function CompactionSummaryPanel({ bot }: { bot: Bot }) {
  const { state } = useStore();
  const live = state.bots.find((candidate) => candidate.id === bot.id) ?? bot;
  const compaction = visibleMessages(currentTaskBot(live, bot.threadId)).filter((message) => message.compaction && !message.compaction.fresh).at(-1)?.compaction;
  const excerpts = compaction?.summary.startsWith(EXCERPT_SUMMARY_HEADER) ?? false;
  return (
    <div className="flex flex-col gap-2 pt-2" data-testid="compaction-summary-panel">
      <div className="text-[13px] font-medium text-ink">{t("chat.compactionTitle")}</div>
      {compaction ? (
        <>
          <p className="text-[12px] text-ink-secondary">{t(excerpts ? "chat.compactionExcerptHint" : "chat.compactionHint")}</p>
          <p className="whitespace-pre-wrap break-words text-[13px] leading-6 text-ink">{compaction.summary}</p>
        </>
      ) : (
        <p className="text-[13px] text-ink-secondary">{t("chat.compactionEmpty")}</p>
      )}
    </div>
  );
}
