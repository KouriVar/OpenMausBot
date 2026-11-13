import type { LocaleKey } from "@/locales";
import type { Message, OptionCardData } from "@/state/store";
import { cardAutomation } from "./automations";
import type { TranscriptItem } from "./activity-runs";

/** What an applied change touched. The chip names the one kind a run holds, or counts a mixed run. */
export type AutoAppliedKind = "skill" | "automation" | "other";

/** A change a reply applied on its own: its row is the applied-change line (Undo and Details), so it belongs inside
 * that reply's bubble. An automation it made is not one of those rows: that card carries the plan itself (when it runs
 * next, and Undo) and stays in the chat as a card. */
export function isAutoAppliedChange(message: Message): boolean {
  const card = message.card;
  if (message.kind !== "options" || !card || card.autoApplied !== true || card.answered !== "allow" || card.held) return false;
  return !cardAutomation(card);
}

/** Skills, automations (schedules, webhooks, app events), or anything else — memory, a profile, a model. */
export function autoAppliedKind(card: OptionCardData): AutoAppliedKind {
  if (card.skillRequest) return "skill";
  if (card.routineRequest || card.webhookRequest || card.appTriggerRequest) return "automation";
  return "other";
}

export interface AutoAppliedTitle {
  key: LocaleKey;
  params?: { count: number };
}

/** The chip's words: skills alone, automations alone, or how many changes of mixed kinds landed. */
export function autoAppliedTitle(kinds: readonly AutoAppliedKind[]): AutoAppliedTitle {
  if (kinds.length > 0 && kinds.every((kind) => kind === "skill")) return { key: "chat.learnedSkills.title" };
  if (kinds.length > 0 && kinds.every((kind) => kind === "automation")) {
    return { key: kinds.length === 1 ? "chat.autoApplied.automation.one" : "chat.autoApplied.automation.many" };
  }
  return { key: kinds.length === 1 ? "chat.autoApplied.title.one" : "chat.autoApplied.title.many", params: { count: kinds.length } };
}

/** The reply each run of applied changes folds into, and the rows the transcript takes out of its columns. */
export function foldAutoAppliedChanges(items: readonly TranscriptItem[]): { hosts: Map<string, Message[]>; consumed: Set<string> } {
  const hosts = new Map<string, Message[]>();
  const consumed = new Set<string>();
  let host: Message | null = null;
  for (const item of items) {
    // A run of tool chips or a digest between the reply and its change card does not move the card to another bubble.
    if (item.kind !== "message") continue;
    const message = item.message;
    if (isAutoAppliedChange(message)) {
      if (host) {
        consumed.add(message.id);
        hosts.set(host.id, [...(hosts.get(host.id) ?? []), message]);
      }
      continue;
    }
    if (message.role === "user") host = null;
    else if (message.role === "bot" && message.kind === "text") host = message;
  }
  return { hosts, consumed };
}
