import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import type { AmbiguityMark } from "../../shared/composer-ambiguity";
import { parseSkin, skinAnswerText, type SkinSpec } from "../../packages/phone-protocol/src/skins";
import { TRANSCRIPT_GAP } from "@/lib/composer-dock";
import { MENU_ITEM, MENU_SHEET } from "./menu-recipe";
import { OptionSkin } from "./widget/OptionSkin";

function markSkin(mark: AmbiguityMark): SkinSpec {
  if (mark.skin) return mark.skin;
  if (mark.control === "slider") return parseSkin({ ui: "slider", options: mark.options, multi: false });
  return parseSkin({ ui: "list", options: mark.options });
}

/** The small panel a dashed word opens: the meanings it could carry here, in the control the model chose. */
export function AmbiguityPanel({ mark, rect, selected, onPick, onClose }: {
  mark: AmbiguityMark;
  rect: DOMRect;
  selected?: string;
  onPick: (meaning: string | null, keepOpen?: boolean) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState<number>();
  const [draft, setDraft] = useState(selected ?? "");
  useEffect(() => {
    const away = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || panel.current?.contains(event.target)) return;
      onClose();
    };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("pointerdown", away, true);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", away, true);
      window.removeEventListener("keydown", key);
    };
  }, [onClose]);

  const skin = markSkin(mark);
  const width = skin.ui === "pad" || skin.ui === "map" || skin.ui === "grid" || skin.ui === "layouts" ? 320 : 292;
  const composer = document.querySelector<HTMLElement>('[data-tour="composer"]');
  const bottom = composer
    ? `calc(100vh - ${composer.getBoundingClientRect().top}px + ${TRANSCRIPT_GAP})`
    : `calc(100vh - ${rect.top}px + ${TRANSCRIPT_GAP})`;
  useLayoutEffect(() => {
    const box = panel.current;
    if (!box) return;
    const content = box.querySelector<HTMLElement>("[data-ambiguity-content]");
    const contentLeft = (content ?? box).getBoundingClientRect().left - box.getBoundingClientRect().left;
    const card = composer?.closest("[data-inset-card]");
    const bounds = card?.getBoundingClientRect();
    const min = (bounds?.left ?? 8) + 8;
    const max = (bounds?.right ?? window.innerWidth) - width - 8;
    setLeft(Math.min(Math.max(min, rect.left - contentLeft), Math.max(min, max)));
  }, [composer, rect.left, width]);
  return (
    <div
      ref={panel}
      role="dialog"
      aria-label={t("composer.ambiguity.title", { word: mark.word })}
      className={cn(MENU_SHEET, "pointer-events-auto fixed z-[70] !gap-1.5 animate-pop-in")}
      style={{ left, bottom, width, visibility: left === undefined ? "hidden" : undefined }}
    >
      <div className="flex items-start gap-2 px-2 pb-1 pt-1.5">
        <span data-ambiguity-content className="min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-ink">
          <bdi dir="auto">{mark.word}</bdi>
        </span>
        <button type="button" onClick={onClose} aria-label={t("composer.ambiguity.close")} className="flex size-6 shrink-0 items-center justify-center rounded-md text-ink-tertiary hover:bg-menu-hover hover:text-ink">
          <X size={14} />
        </button>
      </div>
      <div className="px-1.5 pb-1">
        <OptionSkin spec={skin} value={draft || selected || ""} ariaLabel={t("composer.ambiguity.title", { word: mark.word })}
          onChange={(next) => {
            setDraft(next);
            if (next) onPick(skinAnswerText(skin, next) ?? next, skin.ui === "slider" || skin.ui === "range");
          }} />
      </div>
      {selected !== undefined && (
        <button type="button" onClick={() => onPick(null)} className={cn(MENU_ITEM, "mb-1 min-h-8 text-ink-tertiary")}>
          {t("composer.ambiguity.clear")}
        </button>
      )}
    </div>
  );
}
