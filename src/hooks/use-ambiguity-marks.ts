import { useEffect, useState } from "react";

import { api } from "@/state/api";
import { AMBIGUITY_TIMEOUT_MS, type AmbiguityMark } from "../../shared/composer-ambiguity";

const DEBOUNCE_MS = 600;

/** Words the fast model marks in an unsent draft, after a pause; silence on every failure, and never while an IME composes. */
export function useAmbiguityMarks(enabled: boolean, botId: string | undefined, threadId: string | undefined, text: string, composing: boolean): AmbiguityMark[] {
  const [marks, setMarks] = useState<AmbiguityMark[]>([]);
  useEffect(() => {
    setMarks([]);
    if (!enabled || composing || !botId || text.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void api<{ marks?: AmbiguityMark[] }>("/api/composer/ambiguities", {
        method: "POST",
        body: JSON.stringify({ botId, threadId, text }),
        signal: controller.signal,
        timeoutMs: AMBIGUITY_TIMEOUT_MS,
        background: true,
      }).then((answer) => {
        const next = (answer.marks ?? []).filter((mark) =>
          typeof mark.word === "string" && Number.isInteger(mark.start) && Number.isInteger(mark.end)
          && mark.start >= 0 && mark.end > mark.start && mark.end <= text.length
          && text.slice(mark.start, mark.end).toLocaleLowerCase() === mark.word.toLocaleLowerCase()
          && Array.isArray(mark.options)
          && (mark.skin?.ui === "dates" || mark.skin?.ui === "time" || mark.skin?.ui === "slider" || mark.skin?.ui === "range" || mark.options.length >= 2));
        setMarks(next.slice(0, 3));
      }).catch(() => {
        // Network trouble or a timeout simply leaves the draft unmarked.
      });
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [botId, composing, enabled, text, threadId]);
  return marks;
}
