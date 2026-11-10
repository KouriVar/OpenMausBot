// Fork: the first-reply rescue's row stores its sentence in English (`notice: …`) for clients that only
// print tool names; the desktop draws its own translated line, but a fallback path printed the stored
// English. These map those stored sentences to the same keys the row uses, so both paths read zh-CN.
import { t } from "@/lib/i18n";

const WAITING = /^notice: (.+) hasn't heard back from (.+) yet\.$/;
const OVER = /^notice: (.+) didn't hear back from (.+?)\.$/;

/** The stored rescue sentence in the locale; anything unrecognised is left as it came. */
export function localizedRescueText(text: string): string {
  const waiting = WAITING.exec(text);
  if (waiting) return t("chat.rescue.waiting", { bot: waiting[1]!, ai: waiting[2]! });
  const over = OVER.exec(text);
  if (over) return t("chat.rescue.over", { bot: over[1]!, ai: over[2]! });
  return text;
}
