// A2UI inputs drawn with the chat's own field, checkbox, radio, calendar and
// menu parts; none of them is a browser control that the app styles itself.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { cn } from "@/lib/cn";
import { intlLocale, t } from "@/lib/i18n";
import { WIDGET_CAPTION } from "@/components/widget/WidgetFields";
import { WIDGET_FIELD } from "@/components/widget/WidgetControls";
import { WidgetMenu } from "@/components/widget/WidgetMenu";
import { MENU_ITEM } from "@/components/menu-recipe";

const MARK = "shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-focus";
const MARK_IDLE = "shadow-[inset_0_0_0_1.5px_var(--color-ink-tertiary)]";

export function A2uiTextField({ label, value, onChange, placeholder, long, numeric, id }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; long?: boolean; numeric?: boolean; id?: string;
}) {
  const auto = useId();
  const field = id ?? auto;
  const shared = { id: field, dir: "auto" as const, value, placeholder, "aria-label": label, onChange: (event: { target: { value: string } }) => onChange(event.target.value) };
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={field} dir="auto" className={WIDGET_CAPTION}>{label}</label>
      {long
        ? <textarea {...shared} rows={3} className={cn(WIDGET_FIELD, "h-auto resize-none py-2")} />
        : <input {...shared} type="text" inputMode={numeric ? "decimal" : undefined} className={WIDGET_FIELD} />}
    </div>
  );
}

export function A2uiCheckBox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="relative flex min-h-[36px] min-w-0 cursor-pointer items-center gap-3 text-[14px] leading-5 text-ink">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className={cn("flex size-[18px] items-center justify-center rounded-[6px]", MARK, checked ? "bg-accent text-accent-ink" : MARK_IDLE)}>
        {checked && <Check size={12} strokeWidth={2.6} />}
      </span>
      <span dir="auto" className="min-w-0 flex-1">{label}</span>
    </label>
  );
}

export interface A2uiOption { label: string; value: string }

export function A2uiChoicePicker({ label, options, value, onChange, multiple, chips }: {
  label?: string; options: A2uiOption[]; value: string[]; onChange: (next: string[]) => void; multiple: boolean; chips: boolean;
}) {
  const id = useId();
  const toggle = (option: string) => {
    if (!multiple) return onChange([option]);
    onChange(value.includes(option) ? value.filter((each) => each !== option) : [...value, option]);
  };
  return (
    <div role="group" aria-label={label} aria-labelledby={label ? undefined : id} className="flex min-w-0 flex-col gap-1.5">
      {label && <div id={id} dir="auto" className={WIDGET_CAPTION}>{label}</div>}
      <div className="flex flex-wrap gap-x-[18px] gap-y-2">
        {options.map((option) => {
          const on = value.includes(option.value);
          if (chips) {
            return (
              <button key={option.value} type="button" aria-pressed={on} onClick={() => toggle(option.value)}
                className={cn("inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border px-3 text-[13px] leading-[18px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  on ? "border-transparent bg-accent text-accent-ink" : "border-hairline/50 bg-inset text-ink hover:bg-ink/[0.07]")}>
                {option.label}
              </button>
            );
          }
          return (
            <label key={option.value} className="relative inline-flex min-w-0 cursor-pointer items-center gap-2 text-[14px] leading-5 text-ink">
              <input type={multiple ? "checkbox" : "radio"} name={multiple ? undefined : id} checked={on} onChange={() => toggle(option.value)} className="peer sr-only" />
              {multiple
                ? <span aria-hidden="true" className={cn("flex size-[18px] items-center justify-center rounded-[6px]", MARK, on ? "bg-accent text-accent-ink" : MARK_IDLE)}>{on && <Check size={12} strokeWidth={2.6} />}</span>
                : <span aria-hidden="true" className={cn("size-[18px] rounded-full", MARK, on ? "shadow-[inset_0_0_0_5.5px_var(--color-accent)]" : MARK_IDLE)} />}
              <span dir="auto" className="min-w-0">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function A2uiSlider({ label, value, onChange, min, max, steps }: {
  label?: string; value: number; onChange: (value: number) => void; min: number; max: number; steps?: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const span = max > min ? max - min : 1;
  const step = steps && steps > 0 ? span / steps : span / 100;
  const clamp = (next: number) => Math.min(max, Math.max(min, Number.isFinite(next) ? next : min));
  const snap = (next: number) => (steps && steps > 0 ? min + Math.round((next - min) / step) * step : next);
  const at = clamp(value);
  const percent = ((at - min) / span) * 100;
  const setFrom = (clientX: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    onChange(clamp(snap(min + ratio * span)));
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = event.key === "ArrowRight" || event.key === "ArrowUp" ? at + step
      : event.key === "ArrowLeft" || event.key === "ArrowDown" ? at - step
        : event.key === "Home" ? min : event.key === "End" ? max : undefined;
    if (next === undefined) return;
    event.preventDefault();
    onChange(clamp(snap(next)));
  };
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <span dir="auto" className={WIDGET_CAPTION}>{label}</span>
          <span className="text-[12px] leading-4 tabular-nums text-ink-tertiary">{Math.round(at * 100) / 100}</span>
        </div>
      )}
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={at}
        onKeyDown={key}
        onPointerDown={(event: PointerEvent<HTMLDivElement>) => { event.currentTarget.setPointerCapture(event.pointerId); setFrom(event.clientX); }}
        onPointerMove={(event: PointerEvent<HTMLDivElement>) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) setFrom(event.clientX); }}
        className="relative flex h-9 min-w-0 touch-none items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <div aria-hidden="true" className="h-1 w-full rounded-full bg-ink/15">
          <div className="h-1 rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute size-3.5 -translate-x-1/2 rounded-full bg-accent shadow-sm ring-2 ring-composer" style={{ left: `${percent}%` }} />
      </div>
    </div>
  );
}

const isoDay = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function A2uiDateField({ value, onChange, min, max, label }: {
  value: string; onChange: (value: string) => void; min?: string; max?: string; label: string;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const [cursor, setCursor] = useState(() => {
    const parsed = value ? new Date(`${value.slice(0, 10)}T00:00:00`) : new Date();
    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  });
  useEffect(() => {
    if (!open || !value) return;
    const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) setCursor(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  }, [open, value]);
  const today = isoDay(new Date());
  const monthLabel = new Intl.DateTimeFormat(intlLocale(), { month: "long", year: "numeric" }).format(cursor);
  const weekdays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(intlLocale(), { weekday: "narrow" }).format(new Date(2024, 0, 1 + index)));
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: offset + days }, (_, index) => index < offset ? null : new Date(cursor.getFullYear(), cursor.getMonth(), index - offset + 1));
  const shown = value ? value.slice(0, 10) : "";
  return (
    <span className="relative flex min-w-0 flex-1 items-center">
      <Calendar aria-hidden="true" size={14} className="pointer-events-none absolute start-3 z-[1] text-ink-secondary" />
      <button ref={button} type="button" aria-haspopup="dialog" aria-expanded={open} aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className={cn(WIDGET_FIELD, "flex items-center gap-2 pe-3 ps-8 text-start tabular-nums", !shown && "text-ink-tertiary")}>
        <span dir="auto" className="min-w-0 flex-1 truncate">{shown || t("widget.chooseDate")}</span>
        <ChevronDown aria-hidden="true" size={14} className="shrink-0 text-ink-tertiary" />
      </button>
      <WidgetMenu anchor={button.current} open={open} onClose={() => setOpen(false)} minWidth={252} role="dialog" label={label}>
        <div className="flex items-center justify-between gap-1 px-1 pb-1">
          <button type="button" aria-label={t("widget.previousMonth")} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="flex size-7 items-center justify-center rounded-md text-ink-secondary hover:bg-menu-hover hover:text-ink">
            <ChevronLeft size={15} />
          </button>
          <span className="text-[13px] font-medium leading-[18px] text-ink">{monthLabel}</span>
          <button type="button" aria-label={t("widget.nextMonth")} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="flex size-7 items-center justify-center rounded-md text-ink-secondary hover:bg-menu-hover hover:text-ink">
            <ChevronRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 px-1">
          {weekdays.map((weekday, index) => <span key={index} className="flex size-8 items-center justify-center text-[11px] text-ink-tertiary">{weekday}</span>)}
          {cells.map((date, index) => {
            if (!date) return <span key={index} className="size-8" />;
            const day = isoDay(date);
            const unavailable = (min !== undefined && day < min.slice(0, 10)) || (max !== undefined && day > max.slice(0, 10));
            const chosen = shown === day;
            return (
              <button key={day} type="button" role="gridcell" aria-selected={chosen} disabled={unavailable} onClick={() => { onChange(day); setOpen(false); }}
                className={cn("flex size-8 items-center justify-center rounded-md text-[13px] tabular-nums transition-colors",
                  chosen ? "bg-accent text-accent-ink" : day === today ? "text-ink ring-1 ring-ink/20" : "text-ink-secondary hover:bg-menu-hover hover:text-ink",
                  unavailable && "opacity-40")}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </WidgetMenu>
    </span>
  );
}

/** Quarter-hour slots, no browser time input. */
const TIMES = Array.from({ length: 96 }, (_, index) => `${String(Math.floor(index / 4)).padStart(2, "0")}:${String((index % 4) * 15).padStart(2, "0")}`);

export function A2uiTimeField({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const shown = /^\d{2}:\d{2}$/.test(value) ? value : "";
  return (
    <span className="relative flex min-w-0 flex-1 items-center">
      <Clock aria-hidden="true" size={14} className="pointer-events-none absolute start-3 z-[1] text-ink-secondary" />
      <button ref={button} type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className={cn(WIDGET_FIELD, "flex items-center gap-2 pe-3 ps-8 text-start tabular-nums", !shown && "text-ink-tertiary")}>
        <span dir="auto" className="min-w-0 flex-1 truncate">{shown || "00:00"}</span>
        <ChevronDown aria-hidden="true" size={14} className="shrink-0 text-ink-tertiary" />
      </button>
      <WidgetMenu anchor={button.current} open={open} onClose={() => setOpen(false)} minWidth={140} label={label}>
        {TIMES.map((time) => (
          <button key={time} type="button" role="option" aria-selected={shown === time}
            onClick={() => { onChange(time); setOpen(false); }}
            className={cn(MENU_ITEM, "tabular-nums", shown === time ? "bg-menu-active text-ink" : "text-ink-secondary")}>
            <span className="flex size-4 shrink-0 items-center justify-center">{shown === time && <Check size={13} />}</span>
            {time}
          </button>
        ))}
      </WidgetMenu>
    </span>
  );
}

export function A2uiDateTimeInput({ value, onChange, enableDate, enableTime, min, max }: {
  value: string; onChange: (value: string) => void; enableDate: boolean; enableTime: boolean; min?: string; max?: string;
}) {
  const date = value.slice(0, 10);
  const time = /T(\d{2}:\d{2})/.exec(value)?.[1] ?? "00:00";
  const join = (day: string, at: string) => (enableTime ? `${day}T${at}` : day);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {enableDate && <A2uiDateField value={date} min={min} max={max} label={t("widget.chooseDate")} onChange={(next) => onChange(join(next, time))} />}
      {enableTime && <A2uiTimeField value={time} label="hh:mm" onChange={(next) => onChange(join(date || isoDay(new Date()), next))} />}
    </div>
  );
}
