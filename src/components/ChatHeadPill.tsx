import { localizedTaskTitle } from "@/lib/task-title";
import { ChevronRight, Lock, UserRound, Users } from "lucide-react";
import { useRef, type ComponentProps } from "react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useStore, type Bot } from "@/state/store";
import { awayFromMainThread } from "@/state/thread-navigation";
import { BotAvatar } from "./Avatar";
import { FORK_BLOUB_SESSION_ANIMATION } from "@/fork/bloub-skin";
import { ELEVATED_FLOAT, ELEVATED_HOVER } from "./elevated";
import { sidebarBotActivityTasks } from "./SidebarBotActivity";
import { BOT_PANEL_ID } from "./bot-panel/side-panel";
import { sharedChatAudience } from "./TeamPrivateChatsLine";

/** The factory title a new conversation starts with. */
const UNTITLED = "New thread";

export type ChatHeadPrivacy = { kind: "private" } | { kind: "ownHelper" } | { kind: "shared"; team: string; onlyPeopleAdded?: boolean } | null;

const PRIVACY_ICONS = { private: Lock, ownHelper: UserRound, shared: Users } as const;

function privacyLabelOf(privacy: ChatHeadPrivacy): string | null {
  switch (privacy?.kind) {
    case "private": return t("team.privateHeader");
    case "ownHelper": return t("team.ownHelperHeader");
    case "shared": return sharedChatAudience(privacy.team, privacy.onlyPeopleAdded);
    default: return null;
  }
}

/** Simple mode's whole chat header: the bot's face and name in one pill, which opens and closes the bot panel. Away from
 * the bot's main conversation it also names the one on screen. A dot says another of the bot's conversations needs a
 * look; a team chat says who can read it with one quiet glyph. */
export function ChatHeadPill({ bot, avatar, privacy, onToggle }: {
  bot: Bot;
  avatar: Pick<ComponentProps<typeof BotAvatar>, "state" | "motion" | "motionKey" | "animated">;
  privacy: ChatHeadPrivacy;
  onToggle: () => void;
}) {
  const { state } = useStore();
  const open = state.settingsOpen;
  const elsewhere = sidebarBotActivityTasks(bot, state.pendingQueued).filter((task) => task.threadId !== bot.threadId).length;
  const privacyLabel = privacyLabelOf(privacy);
  const PrivacyIcon = privacy ? PRIVACY_ICONS[privacy.kind] : Users;
  const title = bot.tasks?.find((task) => task.threadId === bot.threadId)?.title;
  // Simple mode calls an untitled conversation what it is, never a "thread".
  const conversation = !awayFromMainThread(bot, false) ? (privacy?.kind === "shared" ? t("task.sharedChat") : null)
    : !title || title === UNTITLED ? t("task.untitledChat") : localizedTaskTitle(title);
  const label = t("chat.openProfileAria", { name: bot.name });
  const pillRef = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={pillRef}
      type="button"
      data-chathead-pill
      data-tour="bot-pill"
      onClick={onToggle}
      title={t("chat.openBotPanel")}
      aria-label={conversation ? `${label}, ${conversation}` : label}
      aria-expanded={open}
      aria-controls={open ? BOT_PANEL_ID : undefined}
      className={cn("group flex min-w-0 max-w-full items-center gap-2 rounded-full px-[7.5px] py-[7.5px] text-ink", ELEVATED_FLOAT, ELEVATED_HOVER)}
    >
      <BotAvatar bot={bot} size={24} {...avatar} hitRef={pillRef} sessionAnimation={FORK_BLOUB_SESSION_ANIMATION.chatHeader} />
      <span dir="auto" className="min-w-0 truncate text-[14px] font-medium leading-5">{bot.name}</span>
      {conversation && (
        <>
          <ChevronRight size={12} aria-hidden="true" className="shrink-0 text-ink-tertiary" />
          <span data-chathead-conversation dir="auto" className="min-w-0 max-w-[180px] truncate text-[14px] font-medium leading-5 text-ink-secondary">{conversation}</span>
        </>
      )}
      {privacyLabel && (
        <span data-chathead-privacy={privacy?.kind} title={privacyLabel} className="flex shrink-0 text-ink-tertiary">
          <PrivacyIcon size={13} aria-hidden="true" />
          <span className="sr-only">{privacyLabel}</span>
        </span>
      )}
      {elsewhere > 0 && (
        <span role="img" data-chathead-elsewhere aria-label={t("task.otherActivity", { count: elsewhere })} className="size-1.5 shrink-0 rounded-full bg-accent" />
      )}
    </button>
  );
}
