// The Screen panel's view of a bot whose cloud desktop is the person's own Simular Box: it is up when its MCP server is
// signed in, its screen is worth a still only while the bot is working (every capture wakes a desktop that costs its
// owner credits), and taking control happens at the box's own portal, where the person is already signed in.

import { useEffect } from "react";

import { api } from "@/state/store";
import { t } from "@/lib/i18n";
import { SIMULAR_BOX_URL, isSimularBackend } from "../../shared/simular";
import { LocalizedPanelError } from "@/lib/computer-messages";
import type { Bot } from "@/state/store";
import type { CloudBackend } from "../../shared/wire";
import type { Phase } from "./computer-panel-phases";

/** `true` when this bot's cloud desktop is the person's box. */
export const simularCloud = (cloudBackend: CloudBackend | undefined): boolean => isSimularBackend(cloudBackend ?? "box");

/** The box answers for itself: a sign-in is the whole status, and it never starts or wakes this app's own cloud. */
export function useSimularBoxPhase(input: {
  enabled: boolean;
  /** The status endpoint, already resolved for this bot and conversation. */
  path: string;
  bot: Pick<Bot, "id" | "threadId" | "computer">;
  cloudBackend: CloudBackend;
  retry: number;
  onResolved(): void;
  onPhase(phase: Phase): void;
  onError(error: unknown): void;
}): void {
  const { enabled, path, cloudBackend, retry } = input;
  const { id, threadId, computer } = input.bot;
  const { onResolved, onPhase, onError } = input;
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    api(path)
      .then((status: { configured?: boolean }) => {
        if (!alive) return;
        onResolved();
        onPhase(status.configured ? "ready" : "unconfigured");
      })
      .catch((error: unknown) => {
        if (!alive) return;
        onError(error);
        onPhase("error");
      });
    return () => {
      alive = false;
    };
    // The setters are stable; the bot and the backend are compared by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, path, id, threadId, computer, cloudBackend, retry]);
}

/** Only while the bot is working: an idle panel must not wake the box, which spends its owner's hours. */
export const simularStillWanted = (box: boolean, busy: boolean): boolean => !box || busy;

/** What the panel says instead of a spinner while it is deliberately not capturing. */
export const simularQuietNote = (box: boolean, busy: boolean): string | null =>
  box && !busy ? t("computer.preview.simularIdle") : null;

/** Simular's own page is signed in as the person; this app's viewer would be a different, signed-out session. */
export async function openSimularBox(setError: (error: string | Error | null) => void): Promise<void> {
  setError(null);
  if (window.ogb?.openExternal) {
    if (!(await window.ogb.openExternal(SIMULAR_BOX_URL))) setError(new LocalizedPanelError("computer.err.openDesktopLink"));
    return;
  }
  if (!window.open(SIMULAR_BOX_URL, "_blank", "noopener")) setError(new LocalizedPanelError("computer.err.popupBlocked"));
}
