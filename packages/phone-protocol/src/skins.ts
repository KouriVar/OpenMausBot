/** The kinds of control an answer may draw for a set of choices. One option list
 * is the data everywhere; `ui` only says how it is drawn, so an unknown or
 * unusable skin can always fall back to plain text chips. */
export const SKIN_UIS = [
  "list", "samples", "swatches", "fonts", "thumbs", "slider", "range", "dates",
  "time", "emoji", "toggle", "grid", "pad", "layouts", "map",
] as const;

export type SkinUi = (typeof SKIN_UIS)[number];

export interface SkinOption {
  label: string;
  value?: string;
  /** A whole example sentence for `samples`. */
  sample?: string;
  /** One to four CSS colours for `swatches`; only the dots use them. */
  hex?: string[];
  /** A font family for `fonts`; the browser falls back to its own if absent. */
  font?: string;
  /** An existing widget icon name, or a short emoji for `thumbs`/`emoji`. */
  icon?: string;
  /** A point for `map`. */
  lat?: number;
  lng?: number;
  /** A named line drawing for `layouts`, or a for `grid` cell's short note. */
  layout?: string;
  note?: string;
}

export interface SkinAxis {
  label?: string;
  start?: string;
  end?: string;
}

export interface SkinSpec {
  ui: SkinUi;
  options: SkinOption[];
  multi?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number;
  unit?: string;
  /** End labels drawn at a slider's two ends when its text would not fit. */
  minLabel?: string;
  maxLabel?: string;
  /** Minutes between the time skin's minute choices. */
  minuteStep?: number;
  /** How many columns an emoji grid uses; three for the nine-cell grid. */
  columns?: number;
  /** Names for a two-dimensional pad's axes and ends. */
  axes?: { x?: SkinAxis; y?: SkinAxis };
  /** The phrase each pad point stands for, row by row. */
  cells?: string[];
  placeholder?: string;
  other?: boolean;
}

export const SKIN_MAX_OPTIONS = 40;
const SKIN_VALUE_MAX = 120;
const SKIN_KEY = /^[\p{L}\p{N}_.:-]{1,64}$/u;
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const LAYOUTS = new Set(["hero", "split", "stack", "sidebar", "gallery", "cards", "list", "magazine", "poster"]);
const GRID_UI = ["grid", "pad"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function short(value: unknown, limit = SKIN_VALUE_MAX): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text && text.length <= limit ? text : undefined;
}

function finite(value: unknown): number | undefined {
  const number = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : undefined;
}

function axis(raw: unknown): SkinAxis | undefined {
  if (!isRecord(raw)) return undefined;
  const label = short(raw.label, 60);
  const start = short(raw.start, 60);
  const end = short(raw.end, 60);
  return label || start || end ? { ...(label ? { label } : {}), ...(start ? { start } : {}), ...(end ? { end } : {}) } : undefined;
}

/** One option from a model's loose object. `value` is what the answer stores;
 * it defaults to the label, as a widget option's value does. */
export function parseSkinOption(raw: unknown): SkinOption | null {
  const record = isRecord(raw) ? raw : { label: raw };
  const label = short(record.label) ?? short(record.value);
  if (!label) return null;
  const value = short(record.value);
  const option: SkinOption = { label };
  if (value && value !== label) option.value = value;
  const sample = short(record.sample, 240);
  if (sample) option.sample = sample;
  const colours = (Array.isArray(record.hex) ? record.hex : typeof record.hex === "string" ? record.hex.split(/[,\s]+/) : [])
    .flatMap((colour) => short(colour, 20) ?? [])
    .filter((colour) => HEX.test(colour))
    .slice(0, 4);
  if (colours.length) option.hex = colours;
  const font = short(record.font, 120);
  if (font) option.font = font;
  const icon = short(record.icon ?? record.emoji, 24);
  if (icon) option.icon = icon;
  const lat = finite(record.lat);
  const lng = finite(record.lng);
  if (lat !== undefined && lng !== undefined && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    option.lat = lat;
    option.lng = lng;
  }
  const layout = short(record.layout, 40)?.toLowerCase();
  if (layout && LAYOUTS.has(layout)) option.layout = layout;
  const note = short(record.note, 120);
  if (note) option.note = note;
  return option;
}

/** A model's skin, kept only where it is usable. Dates and times need no options;
 * everything else falls back to `list` when the data cannot draw it. */
export function parseSkin(raw: unknown, fallback: SkinUi = "list"): SkinSpec {
  const record = isRecord(raw) ? raw : {};
  const asked = typeof record.ui === "string" && (SKIN_UIS as readonly string[]).includes(record.ui)
    ? record.ui as SkinUi
    : fallback;
  const list = Array.isArray(record.options) ? record.options : [];
  const seen = new Set<string>();
  const options: SkinOption[] = [];
  for (const entry of list) {
    const option = parseSkinOption(entry);
    if (!option) continue;
    const key = (option.value ?? option.label).toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(option);
    if (options.length === SKIN_MAX_OPTIONS) break;
  }
  const min = finite(record.min) ?? short(record.min, 32);
  const max = finite(record.max) ?? short(record.max, 32);
  const step = finite(record.step);
  const minuteStep = finite(record.minuteStep ?? record.minute_step);
  const columns = finite(record.columns);
  const axes = isRecord(record.axes) ? { x: axis(record.axes.x), y: axis(record.axes.y) } : undefined;
  const cells = Array.isArray(record.cells) ? record.cells.flatMap((cell) => short(cell, 160) ?? []) : [];
  const spec: SkinSpec = {
    ui: asked,
    options,
    ...(record.multi === true ? { multi: true } : {}),
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
    ...(step !== undefined && step > 0 ? { step } : {}),
    ...(short(record.unit, 16) ? { unit: short(record.unit, 16)! } : {}),
    ...(short(record.minLabel, 60) ? { minLabel: short(record.minLabel, 60)! } : {}),
    ...(short(record.maxLabel, 60) ? { maxLabel: short(record.maxLabel, 60)! } : {}),
    ...(minuteStep !== undefined ? { minuteStep } : {}),
    ...(columns !== undefined ? { columns } : {}),
    ...(axes?.x || axes?.y ? { axes } : {}),
    ...(cells.length ? { cells: cells.slice(0, 16) } : {}),
    ...(short(record.placeholder, 120) ? { placeholder: short(record.placeholder, 120)! } : {}),
    ...(record.other === true || record.allowOther === true ? { other: true } : {}),
  };
  return usableSkin(spec);
}

/** The skin a renderer may draw. A slider over words needs two grades; a grid
 * wants nine cells; a map needs points. Anything else is the list it always had. */
export function usableSkin(spec: SkinSpec): SkinSpec {
  const count = spec.options.length;
  const numeric = typeof spec.min === "number" && typeof spec.max === "number" && spec.max > spec.min;
  switch (spec.ui) {
    case "dates":
    case "time":
      return spec;
    case "slider":
      return count >= 2 || numeric ? withNumbers(spec) : { ...spec, ui: "list" };
    case "range":
      return count >= 2 || numeric ? withNumbers(spec) : { ...spec, ui: "list" };
    case "toggle":
      return count === 2 ? spec : { ...spec, ui: "list" };
    case "grid":
      return count === 9 ? spec : { ...spec, ui: "list" };
    case "map":
      return count >= 2 && spec.options.some((option) => option.lat !== undefined) ? spec : { ...spec, ui: "list" };
    case "pad":
      return spec.axes?.x && spec.axes?.y && (spec.cells?.length ?? 0) >= 2 ? spec : { ...spec, ui: "list" };
    case "swatches":
    case "fonts":
    case "layouts":
      return count >= 2 ? spec : { ...spec, ui: "list" };
    case "samples":
    case "thumbs":
      return count >= 2 ? spec : { ...spec, ui: "list" };
    case "emoji":
      return count >= 1 ? spec : { ...spec, ui: "list" };
    default:
      return count >= 1 ? { ...spec, ui: "list" } : { ...spec, ui: "list" };
  }
}

function withNumbers(spec: SkinSpec): SkinSpec {
  if (spec.options.length >= 2 || (typeof spec.min === "number" && typeof spec.max === "number")) return spec;
  return spec;
}

/** Whether `ui` is one of the names the model may write. */
export function isSkinUi(value: unknown): value is SkinUi {
  return typeof value === "string" && (SKIN_UIS as readonly string[]).includes(value);
}

/** An option's stored value, in the form a widget field keeps it. */
export const skinOptionValue = (option: SkinOption): string => option.value ?? option.label;

export function skinOptionIndex(spec: SkinSpec, value: string | undefined): number {
  if (value === undefined || value === "") return -1;
  return spec.options.findIndex((option) => skinOptionValue(option) === value || option.label === value);
}

/** One stored answer as the words a person sees in the filled blank. */
export function skinAnswerText(spec: SkinSpec, value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const labels = parts.map((part) => {
    const option = spec.options[skinOptionIndex(spec, part)];
    if (option) return spec.ui === "samples" ? option.sample ?? option.label : option.label;
    return part;
  });
  if (!labels.length) return undefined;
  if (spec.ui === "range" && labels.length >= 2) return `${labels[0]}${spec.unit ?? ""} – ${labels[labels.length - 1]}${spec.unit ?? ""}`;
  if (spec.ui === "slider" && labels.length === 1 && typeof spec.min === "number" && spec.unit) return `${labels[0]}${spec.unit}`;
  if (spec.ui === "dates" && labels.length >= 2) return `${labels[0]} – ${labels[labels.length - 1]}`;
  return labels.join("、");
}

/** A blank key is also a field name, so it stays safe in a widget field map. */
export const isSkinKey = (value: unknown): value is string => typeof value === "string" && SKIN_KEY.test(value);

/** `grid` and `pad` use this many positions. */
export const GRID_CELLS = 9;
export const gridColumns = (spec: SkinSpec): number => spec.ui === "grid" ? 3 : Math.max(2, Math.min(6, spec.columns ?? 4));
export const isGridSkin = (ui: SkinUi): boolean => (GRID_UI as readonly string[]).includes(ui);
