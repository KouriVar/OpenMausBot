import { useEffect, useRef, useState } from "react";

import { api } from "@/state/api";
import { AMBIGUITY_TIMEOUT_MS, type AmbiguityMark } from "../../shared/composer-ambiguity";

const DEBOUNCE_MS = 600;

/** Words the fast model marks in an unsent draft, after a pause; a failure says so quietly, and an IME composition never triggers it. */
export type AmbiguityStatus = "idle" | "pending" | "failed";
export type AmbiguityFailure = "timeout" | "error";

export function useAmbiguityMarks(enabled: boolean, botId: string | undefined, threadId: string | undefined, text: string, composing: boolean): { marks: AmbiguityMark[]; status: AmbiguityStatus; failure?: AmbiguityFailure } {
  const [marks, setMarks] = useState<AmbiguityMark[]>([]);
  const [status, setStatus] = useState<AmbiguityStatus>("idle");
  const [failure, setFailure] = useState<AmbiguityFailure>();
  const failed = useRef<number>(undefined);
  useEffect(() => {
    setMarks([]);
    setStatus("idle");
    setFailure(undefined);
    window.clearTimeout(failed.current);
    if (!enabled || composing || !botId || text.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus("pending");
      void api<{ marks?: AmbiguityMark[]; failed?: AmbiguityFailure }>("/api/composer/ambiguities", {
        method: "POST",
        body: JSON.stringify({ botId, threadId, text }),
        signal: controller.signal,
        timeoutMs: AMBIGUITY_TIMEOUT_MS,
        background: true,
      }).then((answer) => {
        window.clearTimeout(failed.current);
        if (answer.failed) {
          setStatus("failed");
          setFailure(answer.failed);
          failed.current = window.setTimeout(() => setStatus("idle"), 2_000);
          return;
        }
        setFailure(undefined);
        setStatus("idle");
        const next = (answer.marks ?? []).filter((mark) =>
          typeof mark.word === "string" && Number.isInteger(mark.start) && Number.isInteger(mark.end)
          && mark.start >= 0 && mark.end > mark.start && mark.end <= text.length
          && text.slice(mark.start, mark.end).toLocaleLowerCase() === mark.word.toLocaleLowerCase()
          && Array.isArray(mark.options)
          && (mark.skin?.ui === "dates" || mark.skin?.ui === "time" || mark.skin?.ui === "slider" || mark.skin?.ui === "range" || mark.options.length >= 2));
        setMarks(next.slice(0, 3));
      }).catch(() => {
        // Network trouble or a timeout leaves the draft unmarked and says so quietly for a moment.
        if (controller.signal.aborted) return;
        setStatus("failed");
        setFailure("error");
        window.clearTimeout(failed.current);
        failed.current = window.setTimeout(() => setStatus("idle"), 2_000);
      });
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [botId, composing, enabled, text, threadId]);
  return { marks, status, ...(failure ? { failure } : {}) };
}
