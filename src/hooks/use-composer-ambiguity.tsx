import { useCallback, useState } from "react";

import { AmbiguityPanel } from "@/components/AmbiguityPanel";
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
  const detected = useAmbiguityMarks(enabled, botId, threadId, text, composing);
  const marks = detected.filter((mark) => !assumptions.some((assumption) => assumption.word.toLocaleLowerCase() === mark.word.toLocaleLowerCase()));
  const live = useCallback(() => assumptions.filter((assumption) => text.toLocaleLowerCase().includes(assumption.word.toLocaleLowerCase())), [assumptions, text]);
  const panel = active ? (
    <AmbiguityPanel
      mark={active.mark}
      rect={active.rect}
      onClose={() => setActive(null)}
      onPick={(meaning) => {
        const word = active.mark.word;
        setAssumptions((current) => [...current.filter((assumption) => assumption.word !== word), { word, meaning }]);
        setActive(null);
      }}
    />
  ) : null;
  return {
    marks,
    panel,
    live,
    restore: setAssumptions,
    clear: () => { setAssumptions([]); setActive(null); },
    onMarkClick: (index: number, rect: DOMRect) => {
      const mark = marks[index];
      if (mark) setActive({ mark, rect });
    },
    onCompositionStart: () => { setComposing(true); setActive(null); },
    onCompositionEnd: () => setComposing(false),
  };
}
