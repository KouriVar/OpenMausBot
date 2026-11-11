// Fork: one dot, one place. Every status the sidebar used to scatter over an avatar's corners now colours the same
// bottom-right dot, where the working dot always was: amber waits for the person, green is working, blue is unread
// (or waiting on a teammate), grey is queued. Display only; no data or behaviour changes.
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";

export const FORK_ONE_AVATAR_DOT = true;

export type AvatarDotState = "waiting" | "working" | "unread" | "teammate" | "queued";

/** What the one dot says, highest first: what needs the person, then what the bot is doing, then what is new. */
export function avatarDotState({ waiting = false, working = false, unread = false, teammate = false, queued = false }: {
  waiting?: boolean;
  working?: boolean;
  unread?: boolean;
  teammate?: boolean;
  queued?: boolean;
}): AvatarDotState | null {
  if (waiting) return "waiting";
  if (working) return "working";
  if (unread) return "unread";
  if (teammate) return "teammate";
  if (queued) return "queued";
  return null;
}

export const AVATAR_DOT_TONE: Record<AvatarDotState, string> = {
  waiting: "bg-warning",
  working: "bg-success",
  unread: "bg-accent",
  teammate: "bg-accent",
  queued: "bg-ink-tertiary",
};

const AVATAR_DOT_LABEL: Record<AvatarDotState, () => string> = {
  waiting: () => t("sidebar.preview.waiting"),
  working: () => t("chat.activity.working"),
  unread: () => t("task.unread"),
  teammate: () => t("sidebar.preview.waitingOnTeammate"),
  queued: () => t("task.queued"),
};

/** The dot itself: the working dot's own corner and size on every avatar. `surface` is the ring or border that cuts
 * it out of whichever background it sits on (`--tile`, `--row`, the panel). */
export function AvatarStatusDot({ state, surface, size = "size-3" }: { state: AvatarDotState; surface: string; size?: string }) {
  return (
    <span
      aria-hidden="true"
      data-avatar-dot={state}
      data-testid={`${state === "teammate" ? "teammate-wait-dot" : `${state}-dot`}`}
      title={AVATAR_DOT_LABEL[state]()}
      className={cn("absolute -right-0.5 -bottom-0.5 rounded-full", size, surface, AVATAR_DOT_TONE[state])}
    />
  );
}
