// fork 定制：头像只保留右下单点，合上游时此处一律取我方。
// Fork: one status dot per avatar, bottom-right; an upstream merge always keeps our side here.
// Fork: one dot, one place — every sidebar avatar wears it at the bottom-right, where the working dot
// always was. Its colour carries the one state that matters most: a failed turn (or an engine that is
// gone), a wait for the person, work in progress, or unread output. Display only; no data changes.
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";

export const FORK_ONE_AVATAR_DOT = true;

export type AvatarDotState = "error" | "waiting" | "working" | "unread";

/** What the one dot says, highest first: what broke, what needs the person, what is running, what is new.
 * Waiting on a teammate and queued work are said in the row's words, not by a dot. */
export function avatarDotState({ error = false, waiting = false, working = false, unread = false }: {
  error?: boolean;
  waiting?: boolean;
  working?: boolean;
  unread?: boolean;
}): AvatarDotState | null {
  if (error) return "error";
  if (waiting) return "waiting";
  if (working) return "working";
  if (unread) return "unread";
  return null;
}

export const AVATAR_DOT_TONE: Record<AvatarDotState, string> = {
  error: "bg-danger",
  waiting: "bg-warning",
  working: "bg-success",
  unread: "bg-accent",
};

const AVATAR_DOT_LABEL: Record<AvatarDotState, () => string> = {
  error: () => t("sidebar.preview.failed"),
  waiting: () => t("sidebar.preview.waiting"),
  working: () => t("chat.activity.working"),
  unread: () => t("task.unread"),
};

/** The dot itself: the working dot's own corner and size on every avatar. `surface` is the ring or border that cuts
 * it out of whichever background it sits on (`--tile`, `--row`, the panel). */
export function AvatarStatusDot({ state, surface, size = "size-3" }: { state: AvatarDotState; surface: string; size?: string }) {
  return (
    <span
      aria-hidden="true"
      data-avatar-dot={state}
      data-testid={`${state}-dot`}
      title={AVATAR_DOT_LABEL[state]()}
      className={cn("absolute -right-0.5 -bottom-0.5 rounded-full", size, surface, AVATAR_DOT_TONE[state])}
    />
  );
}
