import { useCallback, useState } from "react";

import { AmbiguityPanel } from "@/components/AmbiguityPanel";
import { ComposerAnalysisStatus } from "@/fork/ComposerAnalysisStatus";
import { useMarkAmbiguity } from "@/fork/mark-ambiguity";
import { useAmbiguityMarks } from "@/hooks/use-ambiguity-marks";
import type { AmbiguityMark } from "../../shared/composer-ambiguity";
import type { Assumption } from "../../shared/assumptions";

/** The composer's marked words, the meanings chosen for them, and the panel that asks. */
export function useComposerAmbiguity({ botId, threadId, text }: { botId: string | undefined; threadId: string; text: string }) {
  const enabled = useMarkAmbiguity();
  const [composing, setComposing] = useState(false);
  const [assumptions, setAssumptions] = useState<Assumption[]>([]);
  const [active, setActive] = useState<{ mark: AmbiguityMark; rect: DOMRect } | null>(null);
  const { marks: detected, status, failure } = useAmbiguityMarks(enabled, botId, threadId, text, composing);
  const marks = detected.filter((mark) => !assumptions.some((assumption) => assumption.word.toLocaleLowerCase() === mark.word.toLocaleLowerCase()));
  const clarified = assumptions.flatMap((assumption) => {
    const at = text.toLocaleLowerCase().indexOf(assumption.word.toLocaleLowerCase());
    return at < 0 ? [] : [{ start: at, end: at + assumption.word.length }];
  });
  const live = useCallback(() => assumptions.filter((assumption) => text.toLocaleLowerCase().includes(assumption.word.toLocaleLowerCase())), [assumptions, text]);
  const panel = active ? (
    <AmbiguityPanel
      mark={active.mark}
      rect={active.rect}
      selected={assumptions.find((assumption) => assumption.word === active.mark.word)?.meaning}
      onClose={() => setActive(null)}
      onPick={(meaning, keepOpen) => {
        const word = active.mark.word;
        setAssumptions((current) => meaning
          ? [...current.filter((assumption) => assumption.word !== word), { word, meaning }]
          : current.filter((assumption) => assumption.word !== word));
        if (!keepOpen) setActive(null);
      }}
    />
  ) : null;
  return {
    marks,
    status,
    statusNode: <ComposerAnalysisStatus status={status} failure={failure} />,
    clarified,
    activeMark: active?.mark ?? null,
    panel,
    live,
    restore: setAssumptions,
    clear: () => { setAssumptions([]); setActive(null); },
    onMarkClick: (range: { start: number; end: number }, rect: DOMRect) => {
      const mark = detected.find((candidate) => candidate.start === range.start && candidate.end === range.end);
      if (mark) setActive({ mark, rect });
    },
    onCompositionStart: () => { setComposing(true); setActive(null); },
    onCompositionEnd: () => setComposing(false),
  };
}
