import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { cn } from "@/lib/cn";
import { intlLocale, t } from "@/lib/i18n";
import { MENU_ITEM } from "../menu-recipe";
import { WidgetMenu } from "./WidgetMenu";
import { WIDGET_FIELD, WIDGET_FIELD_ACTION } from "./WidgetControls";
import { isWidgetDot, widgetIcon } from "./widget-icons";
import { skinAnswerText, skinOptionValue, type SkinOption, type SkinSpec } from "../../../packages/phone-protocol/src/skins";

const CHIP = "inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full px-3 text-[13px] leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50";
const CHIP_IDLE = "bg-ink/[0.06] text-ink hover:bg-ink/[0.1]";
const CHIP_ON = "bg-accent/15 text-ink ring-1 ring-accent";
const TILE = "flex min-w-0 flex-col items-start gap-1 rounded-xl border p-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50";
const TILE_IDLE = "border-hairline/50 bg-inset/60 hover:bg-ink/[0.05]";
const TILE_ON = "border-accent bg-accent/10";

export interface OptionSkinProps {
  spec: SkinSpec;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  labelledBy?: string;
  ariaLabel?: string;
  compact?: boolean;
  onPreview?: (text: string | undefined) => void;
  /** The person chose Other: their words go here instead of the field's value. */
  onOther?: (text: string) => void;
  className?: string;
}

function splitValue(value: string): string[] {
  return value.split(",").map((part) => part.trim()).filter(Boolean);
}

function chosen(spec: SkinSpec, value: string, option: SkinOption): boolean {
  const own = skinOptionValue(option);
  return spec.multi ? splitValue(value).includes(own) : value === own || value === option.label;
}

function toggle(spec: SkinSpec, value: string, option: SkinOption): string {
  const own = skinOptionValue(option);
  if (!spec.multi) return own;
  const picked = new Set(splitValue(value));
  if (picked.has(own)) picked.delete(own);
  else picked.add(own);
  return [...picked].join(",");
}

function Glyph({ icon }: { icon: string }) {
  if (isWidgetDot(icon) || /\p{Extended_Pictographic}/u.test(icon)) return <span aria-hidden="true" className="text-[16px] leading-none">{icon}</span>;
  const Icon = widgetIcon(icon);
  return <Icon aria-hidden="true" size={15} strokeWidth={1.7} className="shrink-0" />;
}

export function OptionSkin({ spec, value, onChange, disabled, labelledBy, ariaLabel, compact, onPreview, className }: OptionSkinProps) {
  const ui = spec.ui;
  if (ui !== "dates" && ui !== "time" && spec.options.length === 0 && spec.min === undefined) {
    return <input type="text" dir="auto" value={value} disabled={disabled} aria-label={ariaLabel} maxLength={200}
      placeholder={spec.placeholder ?? t("question.otherPlaceholder")} onChange={(event) => onChange(event.target.value)} className={WIDGET_FIELD} />;
  }
  const role = spec.multi ? "group" : "listbox";
  const group = {
    role,
    "aria-label": labelledBy ? undefined : ariaLabel,
    "aria-labelledby": labelledBy,
    "aria-multiselectable": spec.multi || undefined,
    className: cn("flex min-w-0", className),
  };
  if (ui === "slider") return <SliderSkin spec={spec} value={value} onChange={onChange} disabled={disabled} ariaLabel={ariaLabel} />;
  if (ui === "range") return <RangeSkin spec={spec} value={value} onChange={onChange} disabled={disabled} ariaLabel={ariaLabel} />;
  if (ui === "dates") return <DateSkin spec={spec} value={value} onChange={onChange} disabled={disabled} ariaLabel={ariaLabel} />;
  if (ui === "time") return <TimeSkin spec={spec} value={value} onChange={onChange} disabled={disabled} ariaLabel={ariaLabel} />;
  if (ui === "toggle") return <ToggleSkin spec={spec} value={value} onChange={onChange} disabled={disabled} {...group} />;
  if (ui === "grid") return <GridSkin spec={spec} value={value} onChange={onChange} disabled={disabled} {...group} />;
  if (ui === "pad") return <PadSkin spec={spec} value={value} onChange={onChange} disabled={disabled} onPreview={onPreview} ariaLabel={ariaLabel} />;
  if (ui === "map") return <MapSkin spec={spec} value={value} onChange={onChange} disabled={disabled} {...group} />;
  if (ui === "swatches") return <SwatchSkin spec={spec} value={value} onChange={onChange} disabled={disabled} {...group} />;
  if (ui === "fonts") return <FontSkin spec={spec} value={value} onChange={onChange} disabled={disabled} {...group} />;
  if (ui === "samples") return <SampleSkin spec={spec} value={value} onChange={onChange} disabled={disabled} compact={compact} {...group} />;
  if (ui === "thumbs" || ui === "emoji") return <ThumbSkin spec={spec} value={value} onChange={onChange} disabled={disabled} emoji={ui === "emoji"} {...group} />;
  if (ui === "layouts") return <LayoutSkin spec={spec} value={value} onChange={onChange} disabled={disabled} {...group} />;
  return <ListSkin spec={spec} value={value} onChange={onChange} disabled={disabled} compact={compact} {...group} />;
}

function ListSkin({ spec, value, onChange, onOther, disabled, compact, ...group }: OptionSkinProps & { compact?: boolean }) {
  const [other, setOther] = useState(false);
  const [custom, setCustom] = useState("");
  const externalCustom = onOther ? "" : value && !spec.options.some((option) => chosen(spec, value, option)) ? value : "";
  useEffect(() => {
    if (externalCustom) setOther(true);
    else if (value && spec.options.some((option) => chosen(spec, value, option))) setOther(false);
  }, [externalCustom, spec.options, value]);
  const startOther = () => {
    setOther(true);
    setCustom("");
    if (onOther) onOther("");
    else onChange("");
  };
  const typeOther = (text: string) => {
    setCustom(text);
    if (onOther) onOther(text);
    else onChange(text);
  };
  return (
    <div {...group} className={cn("flex flex-col gap-2", group.className)}>
      <div className={cn("flex min-w-0", compact ? "flex-col gap-1" : "flex-wrap gap-1.5")}>
        {spec.options.map((option) => {
          const on = chosen(spec, value, option);
          return (
            <button key={skinOptionValue(option)} type="button" role={spec.multi ? undefined : "option"} aria-selected={spec.multi ? undefined : on}
              disabled={disabled} onClick={() => onChange(toggle(spec, value, option))} className={cn(CHIP, compact && "w-full justify-start", on ? CHIP_ON : CHIP_IDLE)}>
              <span dir="auto" className="min-w-0 truncate">{option.label}</span>
              {on && <Check aria-hidden="true" size={12} className="shrink-0 text-accent" />}
            </button>
          );
        })}
        {spec.other && !other && (
          <button type="button" disabled={disabled} onClick={startOther} className={cn(CHIP, CHIP_IDLE)}>
            {t("widget.other")}
          </button>
        )}
      </div>
      {spec.other && other && (
        <input type="text" dir="auto" value={onOther ? custom : externalCustom} disabled={disabled} maxLength={200}
          aria-label={ariaLabelFor(group, spec)} placeholder={t("question.otherPlaceholder")}
          onChange={(event) => typeOther(event.target.value)} className={WIDGET_FIELD} />
      )}
    </div>
  );
}

function SampleSkin({ spec, value, onChange, disabled, compact, ...group }: OptionSkinProps & { compact?: boolean }) {
  return (
    <div {...group} className={cn("flex min-w-0 flex-col gap-1", group.className)}>
      {spec.options.map((option) => {
        const on = chosen(spec, value, option);
        return (
          <button key={skinOptionValue(option)} type="button" role="option" aria-selected={on} disabled={disabled}
            onClick={() => onChange(toggle(spec, value, option))} className={cn(TILE, compact ? "gap-0.5 p-2" : "", on ? TILE_ON : TILE_IDLE)}>
            <span dir="auto" className="flex w-full items-center gap-2 text-[13px] font-medium leading-5 text-ink">
              <span className="min-w-0 flex-1">{option.label}</span>
              {on && <Check aria-hidden="true" size={13} className="shrink-0 text-accent" />}
            </span>
            {option.sample && <span dir="auto" className="line-clamp-2 text-[12px] leading-4 text-ink-secondary">{option.sample}</span>}
          </button>
        );
      })}
    </div>
  );
}

function SwatchSkin({ spec, value, onChange, disabled, ...group }: OptionSkinProps) {
  return (
    <div {...group} className={cn("flex flex-wrap gap-1.5", group.className)}>
      {spec.options.map((option) => {
        const on = chosen(spec, value, option);
        const dots = option.hex ?? [];
        return (
          <button key={skinOptionValue(option)} type="button" role={spec.multi ? undefined : "option"} aria-selected={spec.multi ? undefined : on}
            disabled={disabled} onClick={() => onChange(toggle(spec, value, option))}
            className={cn(CHIP, "group ps-2", on ? CHIP_ON : CHIP_IDLE)}>
            <span aria-hidden="true" className="flex shrink-0 items-center -space-x-1">
              {(dots.length ? dots : ["currentColor"]).map((colour, index) => (
                <span key={index} className={cn("size-4 rounded-full transition-transform group-hover:scale-110", on ? "ring-2 ring-accent" : "ring-1 ring-ink/15")} style={{ background: colour }} />
              ))}
            </span>
            <span dir="auto" className="min-w-0 truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FontSkin({ spec, value, onChange, disabled, ...group }: OptionSkinProps) {
  return (
    <div {...group} className={cn("flex min-w-0 flex-col gap-0.5", group.className)}>
      {spec.options.map((option) => {
        const on = chosen(spec, value, option);
        return (
          <button key={skinOptionValue(option)} type="button" role="option" aria-selected={on} disabled={disabled}
            onClick={() => onChange(toggle(spec, value, option))} className={cn(MENU_ITEM, "min-h-9", on && "bg-accent/10")}>
            <span dir="auto" className="min-w-0 flex-1 truncate text-[15px] leading-6" style={{ fontFamily: option.font }}>
              {option.label}
            </span>
            {on && <Check aria-hidden="true" size={13} className="shrink-0 text-accent" />}
          </button>
        );
      })}
    </div>
  );
}

function ThumbSkin({ spec, value, onChange, disabled, emoji, ...group }: OptionSkinProps & { emoji?: boolean }) {
  const columns = Math.max(2, Math.min(6, spec.columns ?? (emoji ? 6 : 3)));
  return (
    <div {...group} className={cn("grid gap-1.5", group.className)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {spec.options.map((option) => {
        const on = chosen(spec, value, option);
        return (
          <button key={skinOptionValue(option)} type="button" role={spec.multi ? undefined : "option"} aria-selected={spec.multi ? undefined : on}
            disabled={disabled} onClick={() => onChange(toggle(spec, value, option))}
            className={cn("flex min-w-0 flex-col items-center gap-1 rounded-xl border px-1.5 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50", on ? TILE_ON : TILE_IDLE)}>
            {option.icon ? <Glyph icon={option.icon} /> : null}
            <span dir="auto" className="w-full truncate text-[11px] leading-4 text-ink-secondary">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ToggleSkin({ spec, value, onChange, disabled, ...group }: OptionSkinProps) {
  return (
    <div {...group} className={cn("inline-flex min-w-0 rounded-full bg-ink/[0.06] p-0.5", group.className)}>
      {spec.options.slice(0, 2).map((option) => {
        const on = chosen(spec, value, option);
        return (
          <button key={skinOptionValue(option)} type="button" role="option" aria-selected={on} disabled={disabled}
            onClick={() => onChange(skinOptionValue(option))}
            className={cn("min-h-7 min-w-0 flex-1 truncate rounded-full px-3 text-[13px] leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              on ? "bg-composer text-ink shadow-sm" : "text-ink-secondary hover:text-ink")}>
            <span dir="auto">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function GridSkin({ spec, value, onChange, disabled, ...group }: OptionSkinProps) {
  return (
    <div {...group} className={cn("grid grid-cols-3 gap-1", group.className)}>
      {spec.options.slice(0, 9).map((option) => {
        const on = chosen(spec, value, option);
        return (
          <button key={skinOptionValue(option)} type="button" role="option" aria-selected={on} disabled={disabled}
            onClick={() => onChange(skinOptionValue(option))}
            className={cn("flex min-h-10 min-w-0 items-center justify-center rounded-lg border px-1.5 text-center text-[12px] leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50", on ? TILE_ON : TILE_IDLE)}>
            <span dir="auto" className="line-clamp-2">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LayoutSkin({ spec, value, onChange, disabled, ...group }: OptionSkinProps) {
  return (
    <div {...group} className={cn("grid grid-cols-2 gap-1.5", group.className)}>
      {spec.options.map((option) => {
        const on = chosen(spec, value, option);
        return (
          <button key={skinOptionValue(option)} type="button" role="option" aria-selected={on} disabled={disabled}
            onClick={() => onChange(skinOptionValue(option))}
            className={cn("flex min-w-0 flex-col gap-1 rounded-xl border p-1.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50", on ? TILE_ON : TILE_IDLE)}>
            <Wireframe layout={option.layout ?? option.label} />
            <span dir="auto" className="w-full truncate px-0.5 text-[11px] leading-4 text-ink-secondary">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const BAR = "rounded-[2px] bg-ink/15";

function Wireframe({ layout }: { layout: string }) {
  const frame = "flex h-12 w-full gap-1 overflow-hidden rounded-md border border-hairline/50 bg-inset/50 p-1";
  if (layout === "split" || layout === "sidebar") {
    return <div aria-hidden="true" className={frame}><div className={cn("h-full w-2/5", BAR)} /><div className="flex flex-1 flex-col gap-1"><div className={cn("h-2 w-full", BAR)} /><div className={cn("h-2 w-4/5", BAR)} /><div className={cn("h-2 w-3/5", BAR)} /></div></div>;
  }
  if (layout === "gallery" || layout === "cards") {
    return <div aria-hidden="true" className={cn(frame, "grid grid-cols-2")}><div className={BAR} /><div className={BAR} /><div className={cn(BAR, "col-span-2")} /></div>;
  }
  if (layout === "list") {
    return <div aria-hidden="true" className={cn(frame, "flex-col")}>{[0, 1, 2].map((row) => <div key={row} className={cn("h-2", BAR, row === 2 ? "w-2/3" : "w-full")} />)}</div>;
  }
  if (layout === "magazine" || layout === "poster" || layout === "hero") {
    return <div aria-hidden="true" className={cn(frame, "flex-col")}><div className={cn("h-5 w-full", BAR)} /><div className="flex flex-1 gap-1"><div className={cn("h-full w-2/3", BAR)} /><div className={cn("h-full flex-1", BAR)} /></div></div>;
  }
  return <div aria-hidden="true" className={cn(frame, "flex-col")}><div className={cn("h-3 w-3/4", BAR)} /><div className={cn("h-2 w-full", BAR)} /><div className={cn("h-2 w-5/6", BAR)} /><div className={cn("h-2 w-1/2", BAR)} /></div>;
}

function MapSkin({ spec, value, onChange, disabled, ...group }: OptionSkinProps) {
  const points = spec.options.filter((option) => option.lat !== undefined && option.lng !== undefined);
  const [preview, setPreview] = useState<string>();
  return (
    <div {...group} className={cn("flex min-w-0 flex-col gap-1.5", group.className)}>
      <div className="relative aspect-[2/1] min-h-28 w-full overflow-hidden rounded-xl border border-hairline/50 bg-inset/50"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-ink) 16%, transparent) 1px, transparent 0)", backgroundSize: "10px 10px" }}>
        {points.map((option) => {
          const on = chosen(spec, value, option);
          const x = ((option.lng! + 180) / 360) * 100;
          const y = ((90 - option.lat!) / 180) * 100;
          return (
            <button key={skinOptionValue(option)} type="button" role="option" aria-selected={on} aria-label={option.label} title={option.label}
              disabled={disabled} onMouseEnter={() => setPreview(option.label)} onMouseLeave={() => setPreview(undefined)} onFocus={() => setPreview(option.label)} onBlur={() => setPreview(undefined)}
              onClick={() => onChange(skinOptionValue(option))}
              className={cn("absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-semibold transition-[scale,background-color] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50",
                on ? "border-accent bg-accent text-accent-ink" : "border-ink/30 bg-composer text-ink-secondary")}
              style={{ left: `${Math.min(97, Math.max(3, x))}%`, top: `${Math.min(92, Math.max(8, y))}%` }}>
              {on ? <Check aria-hidden="true" size={11} /> : null}
            </button>
          );
        })}
      </div>
      <span className="min-h-4 px-0.5 text-[11px] leading-4 text-ink-tertiary" aria-live="polite">{preview ?? (value ? skinAnswerText(spec, value) : "")}</span>
    </div>
  );
}

function PadSkin({ spec, value, onChange, disabled, onPreview, ariaLabel }: OptionSkinProps) {
  const cells = spec.cells ?? [];
  const columns = cells.length === 9 ? 3 : Math.max(2, Math.min(4, spec.columns ?? Math.ceil(Math.sqrt(cells.length || 4))));
  const [preview, setPreview] = useState<string>();
  const show = (cell: string | undefined) => { setPreview(cell); onPreview?.(cell); };
  return (
    <div className="flex min-w-0 flex-col gap-1" aria-label={ariaLabel}>
      {spec.axes?.y && (
        <div className="flex items-center justify-between gap-2 px-1 text-[11px] leading-4 text-ink-tertiary">
          <span dir="auto">{spec.axes.y.end ?? ""}</span>
          <span dir="auto" className="font-medium text-ink-secondary">{spec.axes.y.label}</span>
          <span dir="auto">{spec.axes.y.start ?? ""}</span>
        </div>
      )}
      <div className="flex min-w-0 items-stretch gap-1">
        <div className="grid min-w-0 flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {cells.map((cell) => {
            const on = value === cell;
            return (
              <button key={cell} type="button" role="option" aria-selected={on} aria-label={cell} disabled={disabled}
                onMouseEnter={() => show(cell)} onMouseLeave={() => show(undefined)} onFocus={() => show(cell)} onBlur={() => show(undefined)}
                onPointerEnter={(event) => { if (event.buttons === 1) onChange(cell); }}
                onClick={() => onChange(cell)}
                className={cn("min-h-10 rounded-lg border text-[10px] leading-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50",
                  on ? TILE_ON : TILE_IDLE)} />
            );
          })}
        </div>
        {spec.axes?.x && (
          <div className="flex w-4 shrink-0 flex-col items-center justify-between py-0.5 text-[10px] text-ink-tertiary">
            <span dir="auto" className="[writing-mode:vertical-rl]">{spec.axes.x.end ?? ""}</span>
            <span dir="auto" className="[writing-mode:vertical-rl] font-medium text-ink-secondary">{spec.axes.x.label}</span>
            <span dir="auto" className="[writing-mode:vertical-rl]">{spec.axes.x.start ?? ""}</span>
          </div>
        )}
      </div>
      <span dir="auto" className="min-h-4 px-1 text-[11px] leading-4 text-ink-tertiary" aria-live="polite">{preview ?? skinAnswerText(spec, value) ?? ""}</span>
    </div>
  );
}

function ariaLabelFor(group: Record<string, unknown>, spec: SkinSpec): string {
  return typeof group["aria-label"] === "string" ? group["aria-label"] as string : spec.placeholder ?? t("widget.choose");
}

function SliderSkin({ spec, value, onChange, disabled, ariaLabel }: { spec: SkinSpec; value: string; onChange: (value: string) => void; disabled?: boolean; ariaLabel?: string }) {
  const byOption = spec.options.length >= 2;
  const values = spec.options.map(skinOptionValue);
  const index = Math.max(0, Math.min(values.length - 1, values.indexOf(value)));
  const low = typeof spec.min === "number" ? spec.min : 0;
  const high = typeof spec.max === "number" ? spec.max : 100;
  const step = spec.step ?? 1;
  const number = value && !Number.isNaN(Number(value)) ? Number(value) : low;
  const current = byOption ? spec.options[spec.options.length ? index : 0] : undefined;
  const label = byOption ? current?.label ?? "" : `${number}${spec.unit ?? ""}`;
  const shown = skinAnswerText(spec, value) ?? label;
  const short = (text: string) => text.length > 6 ? `${text.slice(0, 6)}…` : text;
  const first = short(spec.minLabel ?? spec.options[0]?.label ?? (typeof spec.min === "number" ? `${spec.min}${spec.unit ?? ""}` : ""));
  const last = short(spec.maxLabel ?? spec.options[spec.options.length - 1]?.label ?? (typeof spec.max === "number" ? `${spec.max}${spec.unit ?? ""}` : ""));
  const crowded = byOption && (spec.options.length > 3 || spec.options.some((option) => option.label.length > 8));
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span dir="auto" className="min-w-0 truncate text-[13px] font-medium leading-5 text-ink">{shown || spec.placeholder || label}</span>
        {spec.unit && byOption && <span className="shrink-0 text-[11px] text-ink-tertiary">{spec.unit}</span>}
      </div>
      <input type="range" aria-label={ariaLabel ?? spec.placeholder ?? t("composer.ambiguity.scale")}
        min={byOption ? 0 : low} max={byOption ? values.length - 1 : high} step={byOption ? 1 : step}
        value={byOption ? index : number} disabled={disabled}
        onChange={(event) => onChange(byOption ? values[Number(event.target.value)] ?? "" : event.target.value)}
        className="h-5 w-full accent-accent" />
      {crowded && (
        <div className="flex justify-between gap-2 text-[11px] leading-4 text-ink-tertiary">
          <span dir="auto" className="min-w-0 truncate">{first}</span>
          <span dir="auto" className="min-w-0 truncate text-end">{last}</span>
        </div>
      )}
    </div>
  );
}

function RangeSkin({ spec, value, onChange, disabled, ariaLabel }: { spec: SkinSpec; value: string; onChange: (value: string) => void; disabled?: boolean; ariaLabel?: string }) {
  const byOption = spec.options.length >= 2;
  const values = spec.options.map(skinOptionValue);
  const parts = splitValue(value);
  const lowIndex = Math.max(0, values.indexOf(parts[0] ?? ""));
  const highIndex = Math.max(lowIndex, Math.min(values.length - 1, values.indexOf(parts[1] ?? "") >= 0 ? values.indexOf(parts[1]!) : values.length - 1));
  const lowNum = typeof spec.min === "number" ? spec.min : 0;
  const highNum = typeof spec.max === "number" ? spec.max : 100;
  const step = spec.step ?? 1;
  const rangeLow = Math.max(lowNum, Math.min(highNum, Number(parts[0]) || lowNum));
  const rangeHigh = Math.max(rangeLow, Math.min(highNum, Number(parts[1]) || highNum));
  const lowValue = byOption ? values[lowIndex] ?? "" : String(rangeLow);
  const highValue = byOption ? values[highIndex] ?? "" : String(rangeHigh);
  const shown = parts.length >= 2
    ? `${skinAnswerText(spec, lowValue) ?? lowValue} – ${skinAnswerText(spec, highValue) ?? highValue}`
    : spec.placeholder ?? "";
  const push = (nextLow: string, nextHigh: string) => onChange(`${nextLow},${nextHigh}`);
  const first = spec.minLabel ?? spec.options[0]?.label ?? (typeof spec.min === "number" ? `${spec.min}${spec.unit ?? ""}` : "");
  const last = spec.maxLabel ?? spec.options[spec.options.length - 1]?.label ?? (typeof spec.max === "number" ? `${spec.max}${spec.unit ?? ""}` : "");
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span dir="auto" className="min-w-0 truncate text-[13px] font-medium leading-5 text-ink">{shown || spec.placeholder || `${rangeLow}${spec.unit ?? ""} – ${rangeHigh}${spec.unit ?? ""}`}</span>
      <input type="range" aria-label={ariaLabel ? `${ariaLabel} · ${t("widget.skin.from")}` : t("widget.skin.from")}
        min={byOption ? 0 : lowNum} max={byOption ? values.length - 1 : highNum} step={byOption ? 1 : step}
        value={byOption ? lowIndex : rangeLow} disabled={disabled}
        onChange={(event) => {
          if (byOption) {
            const next = Math.min(Number(event.target.value), highIndex);
            push(values[next] ?? "", highValue);
          } else {
            const next = Math.min(Number(event.target.value), rangeHigh);
            push(String(next), highValue);
          }
        }} className="h-4 w-full accent-accent" />
      <input type="range" aria-label={ariaLabel ? `${ariaLabel} · ${t("widget.skin.to")}` : t("widget.skin.to")}
        min={byOption ? 0 : lowNum} max={byOption ? values.length - 1 : highNum} step={byOption ? 1 : step}
        value={byOption ? highIndex : rangeHigh} disabled={disabled}
        onChange={(event) => {
          if (byOption) {
            const next = Math.max(Number(event.target.value), lowIndex);
            push(lowValue, values[next] ?? "");
          } else {
            const next = Math.max(Number(event.target.value), rangeLow);
            push(lowValue, String(next));
          }
        }} className="h-4 w-full accent-accent" />
      {(spec.options.length > 4 || !byOption) && (
        <div className="flex justify-between gap-2 text-[11px] leading-4 text-ink-tertiary">
          <span dir="auto" className="min-w-0 truncate">{first}</span>
          <span dir="auto" className="min-w-0 truncate text-end">{last}</span>
        </div>
      )}
    </div>
  );
}

function isoDay(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function DateSkin({ spec, value, onChange, disabled, ariaLabel }: { spec: SkinSpec; value: string; onChange: (value: string) => void; disabled?: boolean; ariaLabel?: string }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const range = spec.multi === true;
  const parts = splitValue(value);
  const shown = parts.length >= 2 ? `${parts[0]} – ${parts[1]}` : parts[0] ?? "";
  return (
    <span className="flex min-w-0 flex-col gap-1.5">
      <button ref={trigger} type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)} className={cn(WIDGET_FIELD, "flex items-center gap-2 text-start")}>
        <span dir="auto" className={cn("min-w-0 flex-1 truncate tabular-nums", !shown && "text-ink-tertiary")}>{shown || spec.placeholder || t("widget.chooseDate")}</span>
        {shown && !disabled && <span role="button" tabIndex={-1} aria-label={t("widget.clear", { label: ariaLabel ?? t("widget.chooseDate") })} onClick={(event) => { event.stopPropagation(); onChange(""); }} className={WIDGET_FIELD_ACTION}><span aria-hidden="true">×</span></span>}
      </button>
      <WidgetMenu anchor={trigger.current} open={open} onClose={() => setOpen(false)} minWidth={280} role="dialog" label={ariaLabel}>
        <MiniCalendar range={range} value={value} min={typeof spec.min === "string" ? spec.min : undefined}
          max={typeof spec.max === "string" ? spec.max : undefined}
          onChange={(next) => { onChange(next); if (!range || splitValue(next).length >= 2) setOpen(false); }} />
      </WidgetMenu>
    </span>
  );
}

function MiniCalendar({ value, range, min, max, onChange }: { value: string; range: boolean; min?: string; max?: string; onChange: (value: string) => void }) {
  const parts = splitValue(value);
  const anchor = parts[0] ? new Date(`${parts[0]}T00:00:00`) : new Date();
  const [cursor, setCursor] = useState(() => new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const today = isoDay(new Date());
  const monthLabel = new Intl.DateTimeFormat(intlLocale(), { month: "long", year: "numeric" }).format(cursor);
  const weekdays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(intlLocale(), { weekday: "narrow" }).format(new Date(2024, 0, 1 + index)));
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: offset + days }, (_, index) => index < offset ? null : new Date(cursor.getFullYear(), cursor.getMonth(), index - offset + 1));
  const start = parts[0] ?? "";
  const end = parts[1] ?? "";
  const pick = (day: string) => {
    if (!range) return onChange(day);
    if (!start || end) return onChange(day);
    if (day < start) return onChange(`${day},${start}`);
    return onChange(`${start},${day}`);
  };
  return (
    <div className="flex flex-col gap-1 p-0.5">
      <div className="flex items-center justify-between gap-1 px-1 pb-1">
        <button type="button" aria-label={t("widget.previousMonth")} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="flex size-7 items-center justify-center rounded-md text-ink-secondary hover:bg-menu-hover hover:text-ink"><ChevronLeft size={15} /></button>
        <span className="text-[13px] font-medium leading-[18px] text-ink">{monthLabel}</span>
        <button type="button" aria-label={t("widget.nextMonth")} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="flex size-7 items-center justify-center rounded-md text-ink-secondary hover:bg-menu-hover hover:text-ink"><ChevronRight size={15} /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 px-1">
        {weekdays.map((weekday, index) => <span key={index} className="flex size-8 items-center justify-center text-[11px] text-ink-tertiary">{weekday}</span>)}
        {cells.map((date, index) => {
          if (!date) return <span key={index} className="size-8" />;
          const day = isoDay(date);
          const unavailable = day < today || (min !== undefined && day < min) || (max !== undefined && day > max);
          const on = day === start || day === end;
          const inside = Boolean(start && end && day > start && day < end);
          return (
            <button key={day} type="button" role="gridcell" aria-selected={on} disabled={unavailable} onClick={() => pick(day)}
              className={cn("flex size-8 items-center justify-center rounded-md text-[13px] tabular-nums transition-colors",
                on ? "bg-accent text-accent-ink" : inside ? "bg-accent/15 text-ink" : day === today ? "text-ink ring-1 ring-ink/20" : "text-ink-secondary hover:bg-menu-hover hover:text-ink",
                unavailable && "opacity-35")}>
              {date.getDate()}
            </button>
          );
        })}
      </div>
      {range && <p className="px-2 pb-0.5 text-[11px] leading-4 text-ink-tertiary">{start && !end ? t("widget.skin.pickEnd") : t("widget.skin.pickRange")}</p>}
    </div>
  );
}

function TimeSkin({ spec, value, onChange, disabled, ariaLabel }: { spec: SkinSpec; value: string; onChange: (value: string) => void; disabled?: boolean; ariaLabel?: string }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const [hour, minute] = (value || "09:00").split(":");
  const step = Math.max(1, Math.min(60, spec.minuteStep ?? spec.step ?? 15));
  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, index) => String(index * step).padStart(2, "0"));
  const shown = value || "";
  const pick = (nextHour: string, nextMinute: string) => {
    onChange(`${nextHour}:${nextMinute}`);
    setOpen(false);
  };
  return (
    <span className="flex min-w-0 flex-col gap-1.5">
      <button ref={trigger} type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)} className={cn(WIDGET_FIELD, "flex items-center gap-2 text-start tabular-nums")}>
        <Clock aria-hidden="true" size={14} className="shrink-0 text-ink-secondary" />
        <span className={cn("min-w-0 flex-1 truncate", !shown && "text-ink-tertiary")}>{shown || spec.placeholder || t("widget.time.choose")}</span>
      </button>
      <WidgetMenu anchor={trigger.current} open={open} onClose={() => setOpen(false)} minWidth={190} role="dialog" label={ariaLabel}>
        <div className="grid grid-cols-2 gap-1">
          <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto pe-0.5" role="listbox" aria-label={t("widget.skin.hour")}>
            {Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")).map((item) => (
              <button key={item} type="button" role="option" aria-selected={item === hour} onClick={() => pick(item, minute ?? "00")}
                className={cn(MENU_ITEM, "min-h-7 justify-center tabular-nums", item === hour && "bg-accent/10 font-medium")}>{item}</button>
            ))}
          </div>
          <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto ps-0.5" role="listbox" aria-label={t("widget.skin.minute")}>
            {minutes.map((item) => (
              <button key={item} type="button" role="option" aria-selected={item === minute} onClick={() => pick(hour ?? "09", item)}
                className={cn(MENU_ITEM, "min-h-7 justify-center tabular-nums", item === minute && "bg-accent/10 font-medium")}>{item}</button>
            ))}
          </div>
        </div>
      </WidgetMenu>
    </span>
  );
}

export function OptionSkinAnswer({ spec, value }: { spec: SkinSpec; value: string }) {
  const text = useMemo(() => skinAnswerText(spec, value), [spec, value]);
  return <span dir="auto">{text ?? value}</span>;
}
