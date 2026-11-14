import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import type { AmbiguityMark, AmbiguityToken } from "../../shared/composer-ambiguity";
import { TRANSCRIPT_GAP } from "@/lib/composer-dock";
import { MENU_ITEM, MENU_SHEET } from "./menu-recipe";

const TOKEN: Record<AmbiguityToken, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  ink: "bg-ink",
};

/** The small panel a dashed word opens: the meanings it could carry here, in the control the model chose. */
export function AmbiguityPanel({ mark, rect, selected, onPick, onClose }: {
  mark: AmbiguityMark;
  rect: DOMRect;
  selected?: string;
  onPick: (meaning: string | null) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState(() => {
    const at = selected === undefined ? -1 : mark.options.findIndex((option) => option.label === selected);
    return at >= 0 ? at : Math.max(0, Math.floor((mark.options.length - 1) / 2));
  });
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

  const width = 292;
  const pad = 10;
  const left = Math.min(Math.max(8, rect.left - pad - 1), Math.max(8, window.innerWidth - width - 8));
  const composer = document.querySelector<HTMLElement>('[data-tour="composer"]');
  const bottom = composer
    ? `calc(100vh - ${composer.getBoundingClientRect().top}px + ${TRANSCRIPT_GAP})`
    : `calc(100vh - ${rect.top}px + ${TRANSCRIPT_GAP})`;
  const current = mark.options[Math.min(slider, mark.options.length - 1)]!;
  return (
    <div
      ref={panel}
      role="dialog"
      aria-label={t("composer.ambiguity.title", { word: mark.word })}
      className={cn(MENU_SHEET, "pointer-events-auto fixed z-[70] !gap-1.5 !px-0 animate-pop-in")}
      style={{ left, bottom, width, ["--ambiguity-pad" as string]: `${pad}px` }}
    >
      <div className="flex items-start gap-2 pb-1 pt-1.5" style={{ paddingInline: "var(--ambiguity-pad)" }}>
        <span className="min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-ink">
          <bdi dir="auto">{mark.word}</bdi>
        </span>
        <button type="button" onClick={onClose} aria-label={t("composer.ambiguity.close")} className="flex size-6 shrink-0 items-center justify-center rounded-md text-ink-tertiary hover:bg-menu-hover hover:text-ink">
          <X size={14} />
        </button>
      </div>
      {mark.control === "slider" ? (
        <div className="pb-2" style={{ paddingInline: "var(--ambiguity-pad)" }}>
          <input
            type="range"
            min={0}
            max={mark.options.length - 1}
            step={1}
            value={slider}
            onChange={(event) => setSlider(Number(event.target.value))}
            aria-label={t("composer.ambiguity.scale")}
            className="h-5 w-full accent-accent"
          />
          <div className="mt-1 flex justify-between gap-2 text-[11px] leading-4 text-ink-tertiary">
            {mark.options.map((option, index) => <span key={option.label} className={index === slider ? "text-ink" : undefined}>{option.label}</span>)}
          </div>
          <button type="button" onClick={() => onPick(current.label)} className={cn(MENU_ITEM, "mt-2 min-h-8 justify-center bg-ink !px-0 text-app hover:bg-ink/90")} style={{ paddingInline: "var(--ambiguity-pad)" }}>
            {t("composer.ambiguity.use", { meaning: current.label })}
          </button>
        </div>
      ) : mark.control === "swatch" ? (
        <div className="flex flex-col gap-1 pb-1.5">
          {mark.options.map((option) => (
            <button key={option.label} type="button" onClick={() => onPick(option.label)} className={cn(MENU_ITEM, "!px-0 min-h-8", selected === option.label && "bg-accent/10")} style={{ paddingInline: "var(--ambiguity-pad)" }}>
              <span aria-hidden="true" className={cn("size-4 shrink-0 rounded-full ring-1 ring-ink/15", TOKEN[option.token ?? "ink"])} />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <Check size={13} className={cn("shrink-0", selected === option.label ? "text-accent" : "text-ink-tertiary")} />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1 pb-1.5">
          {mark.options.map((option) => (
            <button key={option.label} type="button" onClick={() => onPick(option.label)} className={cn(MENU_ITEM, "!px-0 min-h-8", selected === option.label && "bg-accent/10")} style={{ paddingInline: "var(--ambiguity-pad)" }}>
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <Check size={13} className={cn("shrink-0", selected === option.label ? "text-accent" : "text-ink-tertiary")} />
            </button>
          ))}
        </div>
      )}
      {selected !== undefined && (
        <button type="button" onClick={() => onPick(null)} className={cn(MENU_ITEM, "!px-0 mb-1 min-h-8 text-ink-tertiary")} style={{ marginInline: "var(--ambiguity-pad)", paddingInline: "var(--ambiguity-pad)" }}>
          {t("composer.ambiguity.clear")}
        </button>
      )}
    </div>
  );
}
