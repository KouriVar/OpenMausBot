import { useEffect, useRef, useState } from "react";

import { lastNonReceipt } from "@/lib/receipts";
import type { Bot, Message } from "@/state/store";

/** Bloub's own state ids a bot's turn maps onto. */
export type BloubSessionState =
  | "idle" | "thinking" | "orbit" | "play" | "comet"
  | "alert" | "notify" | "wink" | "exclaim" | "sleep";

const LONG_TASK_EVERY_MS = 7000;
const PLAY_MS = 900;

function toolRunning(last: Message | undefined, busy: boolean): boolean {
  if (!busy || !last || last.kind !== "activity" || !last.tool) return false;
  if (last.tool.ok === false) return false;
  // A tool call that has already answered is a finished step, not a running one.
  return !last.dataResult;
}

/** What a bot is doing, on Bloub's words. `messages`: its visible transcript, newest last. */
export function bloubSessionState(bot: Bot, messages: readonly Message[] | undefined, now = Date.now()): BloubSessionState {
  if (bot.activity === "waiting-on-you") return "alert";
  if (bot.activity === "dead") return "exclaim";
  const last = lastNonReceipt((messages ?? []) as Message[]);
  if (last?.kind === "activity" && last.tool?.ok === false) return "exclaim";
  if (bot.busy) return toolRunning(last, true) ? "orbit" : "thinking";
  if (bot.unread) return "notify";
  const lastAt = last?.at ?? bot.turnStartedAt ?? 0;
  if (lastAt && now - lastAt > 10 * 60_000) return "sleep";
  return "idle";
}

/** The session state on screen: the base one, with a task's brief wink/exclaim and a long task's
 * play/comet interludes played over it. Inert unless the fork's Bloub is the chosen avatar. */
export function useBloubSessionState(bot: Bot, messages: readonly Message[] | undefined, enabled: boolean): BloubSessionState {
  const base = bloubSessionState(bot, messages);
  const [override, setOverride] = useState<{ state: BloubSessionState; until: number } | null>(null);
  const prevBusy = useRef(Boolean(bot.busy));
  const prevError = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (state: BloubSessionState, ms: number) => {
    setOverride({ state, until: Date.now() + ms });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOverride(null), ms);
  };

  // A finished turn (busy true → false) blinks a wink once.
  useEffect(() => {
    if (!enabled) return;
    const wasBusy = prevBusy.current;
    prevBusy.current = Boolean(bot.busy);
    if (wasBusy && !bot.busy && base !== "alert" && base !== "exclaim") flash("wink", 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot.busy, enabled]);

  // A failure shows the exclamation for two seconds, then rests.
  useEffect(() => {
    if (!enabled) return;
    const failed = base === "exclaim";
    if (failed && !prevError.current) flash("exclaim", 2000);
    prevError.current = failed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, enabled]);

  // A long task breaks the orbit every so often with a short play or comet.
  useEffect(() => {
    if (!enabled || base !== "orbit") return;
    let turn = 0;
    const interval = setInterval(() => {
      turn += 1;
      flash(turn % 2 === 1 ? "play" : "comet", PLAY_MS);
    }, LONG_TASK_EVERY_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, enabled]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (override && override.until > Date.now()) return override.state;
  return base;
}
