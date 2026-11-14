import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import type { AmbiguityMark, AmbiguityToken } from "../../shared/composer-ambiguity";
import { MENU_ITEM, MENU_SHEET } from "./menu-recipe";

const TOKEN: Record<AmbiguityToken, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  ink: "bg-ink",
};

/** The small panel a dashed word opens: the meanings it could carry here, in the control the model chose. */
export function AmbiguityPanel({ mark, rect, onPick, onClose }: {
  mark: AmbiguityMark;
  rect: DOMRect;
  onPick: (meaning: string) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState(Math.max(0, Math.floor((mark.options.length - 1) / 2)));
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
  const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
  const bottom = Math.min(window.innerHeight - 8, window.innerHeight - rect.top + 6);
  const current = mark.options[Math.min(slider, mark.options.length - 1)]!;
  return (
    <div
      ref={panel}
      role="dialog"
      aria-label={t("composer.ambiguity.title", { word: mark.word })}
      className={cn(MENU_SHEET, "fixed z-[70] !gap-1.5 animate-pop-in")}
      style={{ left, bottom, width }}
    >
      <div className="flex items-start gap-2 px-2 pb-1 pt-1.5">
        <span className="min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-ink">
          <bdi dir="auto">{mark.word}</bdi>
        </span>
        <button type="button" onClick={onClose} aria-label={t("composer.ambiguity.close")} className="-me-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-ink-tertiary hover:bg-menu-hover hover:text-ink">
          <X size={14} />
        </button>
      </div>
      {mark.control === "slider" ? (
        <div className="px-2 pb-2">
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
          <button type="button" onClick={() => onPick(current.label)} className={cn(MENU_ITEM, "mt-2 min-h-8 justify-center bg-ink px-3 text-app hover:bg-ink/90")}>
            {t("composer.ambiguity.use", { meaning: current.label })}
          </button>
        </div>
      ) : mark.control === "swatch" ? (
        <div className="flex flex-col gap-1 px-1.5 pb-1.5">
          {mark.options.map((option) => (
            <button key={option.label} type="button" onClick={() => onPick(option.label)} className={cn(MENU_ITEM, "min-h-8")}>
              <span aria-hidden="true" className={cn("size-4 shrink-0 rounded-full ring-1 ring-ink/15", TOKEN[option.token ?? "ink"])} />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <Check size={13} className="shrink-0 text-ink-tertiary" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1 px-1.5 pb-1.5">
          {mark.options.map((option) => (
            <button key={option.label} type="button" onClick={() => onPick(option.label)} className={cn(MENU_ITEM, "min-h-8")}>
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <Check size={13} className="shrink-0 text-ink-tertiary" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
