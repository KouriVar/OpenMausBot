import { isSkinKey, parseSkin, skinAnswerText, type SkinSpec } from "./skins.ts";

/** Where a blank sits: only the person knows, they are unsure, or it is theirs to say. */
export const BLANK_KINDS = ["only_you", "unsure", "yours"] as const;
export type BlankKind = (typeof BLANK_KINDS)[number];

export interface BlankDef {
  key: string;
  ask: string;
  kind: BlankKind;
  skin: SkinSpec;
  placeholder?: string;
  /** The words after this blank wait for it; filling it is what lets them show. */
  wait?: boolean;
}

export type BlankPiece =
  | { type: "text"; text: string }
  | { type: "blank"; key: string };

export interface ScannedBlanks {
  pieces: BlankPiece[];
  defs: Record<string, BlankDef>;
  order: string[];
  /** The last `<blank>` has no closing tag yet. */
  pending: boolean;
}

export const BLANK_OPEN = "<blank>";
export const BLANK_CLOSE = "</blank>";
export const BLANK_MAX_BYTES = 12_000;
export const BLANK_MAX_TEXT = 4_000;

/** One `<blank>` payload. Malformed JSON, a missing key or a non-object is not a
 * blank at all; the renderer leaves its words out rather than drawing a broken slot. */
export function parseBlankDef(raw: unknown): BlankDef | null {
  if (typeof raw === "string") {
    if (raw.length > BLANK_MAX_BYTES) return null;
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  if (!isSkinKey(record.key)) return null;
  const ask = typeof record.ask === "string" ? record.ask.replace(/\s+/g, " ").trim().slice(0, 120) : "";
  const kind = typeof record.kind === "string" && (BLANK_KINDS as readonly string[]).includes(record.kind)
    ? record.kind as BlankKind
    : "only_you";
  const placeholder = typeof record.placeholder === "string" ? record.placeholder.trim().slice(0, 120) : undefined;
  const skin = parseSkin(record, typeof record.ui === "string" ? "list" : "list");
  return {
    key: record.key,
    ask: ask || record.key,
    kind,
    skin,
    ...(placeholder ? { placeholder } : {}),
    ...(record.wait === true || kind === "yours" ? { wait: true } : {}),
  };
}

function tag(raw: string): BlankDef | null {
  if (raw.length > BLANK_MAX_BYTES + 32) return null;
  return parseBlankDef(raw.slice(BLANK_OPEN.length, raw.length - BLANK_CLOSE.length));
}

/** Split an answer into ordinary text and the blanks it leaves. An unclosed
 * opening tag is `pending`, never text: a stream must not flash its JSON. */
export function scanBlanks(text: string): ScannedBlanks {
  const pieces: BlankPiece[] = [];
  const defs: Record<string, BlankDef> = {};
  const order: string[] = [];
  let from = 0;
  for (;;) {
    const start = text.indexOf(BLANK_OPEN, from);
    if (start < 0) break;
    const end = text.indexOf(BLANK_CLOSE, start + BLANK_OPEN.length);
    if (end < 0) {
      if (start > from) pieces.push({ type: "text", text: text.slice(from, start) });
      return { pieces, defs, order, pending: true };
    }
    if (start > from) pieces.push({ type: "text", text: text.slice(from, start) });
    const def = tag(text.slice(start, end + BLANK_CLOSE.length));
    if (def && !defs[def.key]) {
      defs[def.key] = def;
      order.push(def.key);
      pieces.push({ type: "blank", key: def.key });
    }
    from = end + BLANK_CLOSE.length;
  }
  if (from < text.length) pieces.push({ type: "text", text: text.slice(from) });
  return { pieces, defs, order, pending: false };
}

/** Every definition in the order they first appear. */
export function blankDefs(text: string): Record<string, BlankDef> {
  return scanBlanks(text).defs;
}

/** Where a key's opening tag begins, or -1. */
export function blankStart(text: string, key: string): number {
  let from = 0;
  for (;;) {
    const start = text.indexOf(BLANK_OPEN, from);
    if (start < 0) return -1;
    const end = text.indexOf(BLANK_CLOSE, start + BLANK_OPEN.length);
    if (end < 0) return -1;
    const def = tag(text.slice(start, end + BLANK_CLOSE.length));
    if (def?.key === key) return start;
    from = end + BLANK_CLOSE.length;
  }
}

/** The paragraph that holds a blank: a rewrite starts at its first character. */
export function paragraphStart(text: string, index: number): number {
  const before = text.slice(0, Math.max(0, index));
  const line = before.lastIndexOf("\n\n");
  return line < 0 ? 0 : line + 2;
}

export interface BlankFillPlan {
  /** The answer before the rewritten part; whole text for a plain continuation. */
  prefix: string;
  /** Paragraphs the model may keep with [[keep N]], 1-based. */
  old: string[];
  /** Whether a changed filled blank asks for the tail to be rewritten. */
  rewrite: boolean;
}

/** Where a continuation starts. A new blank at the end appends; a changed blank
 * rewrites from the start of its paragraph. */
export function blankFillPlan(text: string, key: string, changed: boolean): BlankFillPlan {
  if (!changed) return { prefix: text, old: [], rewrite: false };
  const at = blankStart(text, key);
  if (at < 0) return { prefix: text, old: [], rewrite: false };
  const cut = paragraphStart(text, at);
  const prefix = text.slice(0, cut);
  const old = text.slice(cut).split(/\n{2,}/).slice(1).map((paragraph) => paragraph.trim()).filter(Boolean);
  return { prefix, old, rewrite: true };
}

const KEEP = /^\[\[keep\s+(\d+)\]\].*$/gm;
const KEEP_INLINE = /\[\[keep\s+(\d+)\]\]/g;
const REFERENCE = /\[\[([^\]\n:]+?):\s*([^\]\n]*)\]\]/g;

function clip(text: string, max = BLANK_MAX_TEXT): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** The hidden machine lines the model reads: one per blank, empty included. */
export function hiddenBlankValues(defs: Record<string, BlankDef>, values: Record<string, string>): string {
  return Object.keys(defs).map((key) => {
    const value = values[key]?.trim() ?? "";
    return `[[${key}: ${value || "empty"}]]`;
  }).join("\n");
}

/** What the model reads when a blank is filled. It never reaches the transcript. */
export function blankContinuationPrompt(input: {
  defs: Record<string, BlankDef>;
  values: Record<string, string>;
  plan: BlankFillPlan;
  changed?: string;
}): string {
  const filled = Object.keys(input.defs).map((key) => {
    const def = input.defs[key]!;
    const answer = skinAnswerText(def.skin, input.values[key]) ?? input.values[key]?.trim() ?? "";
    return `- ${key} (${def.ask}): ${answer || "still empty"}`;
  }).join("\n");
  const hidden = hiddenBlankValues(input.defs, input.values);
  if (!input.plan.rewrite) {
    return `The person filled the blanks you left. Continue your answer from where it stopped, using these values. Do not repeat what you already wrote; write only what comes next. Do not ask for these again.\n\nFilled:\n${filled}\n\nHidden values:\n${hidden}`;
  }
  const old = input.plan.old.length
    ? input.plan.old.map((paragraph, index) => `[[keep ${index + 1}]] ${clip(paragraph, 600)}`).join("\n")
    : "(nothing after the changed blank)";
  return `The person changed the blank ${input.changed ? `"${input.changed}"` : "they had filled"}. Rewrite the answer from the start of the paragraph that holds it. Keep an unchanged later paragraph by writing only [[keep N]] on its own line: N is its 1-based number below. Do not repeat the text before the changed paragraph, do not ask for filled values again, and end when the answer is complete.\n\nFilled:\n${filled}\n\nHidden values:\n${hidden}\n\nLater paragraphs you may keep:\n${old}`;
}

/** Resolve [[keep N]] and hidden [[key: value]] lines in a continuation. */
export function resolveContinuation(output: string, old: readonly string[], values: Record<string, string>): string {
  let text = output.replace(/\r\n?/g, "\n").replace(/^\s*\[\[[^\]\n:]+:\s*[^\]\n]*\]\]\n?/, "");
  text = text.replace(KEEP, (_match, raw: string) => old[Number(raw) - 1] ?? "");
  text = text.replace(KEEP_INLINE, (_match, raw: string) => old[Number(raw) - 1] ?? "");
  text = text.replace(REFERENCE, (_match, rawKey: string, fallback: string) => {
    const key = rawKey.trim();
    const value = values[key]?.trim();
    return value ?? (fallback.trim() && fallback.trim() !== "empty" ? fallback.trim() : "");
  });
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/** Join a model's continuation to the answer it continues. */
export function mergeBlankContinuation(input: {
  text: string;
  values: Record<string, string>;
  plan: BlankFillPlan;
  output: string;
}): { text: string; values: Record<string, string> } {
  const written = resolveContinuation(input.output, input.plan.old, input.values);
  if (!written) return { text: input.text, values: input.values };
  const prefix = input.text.slice(0, input.plan.prefix.length);
  const said = input.plan.rewrite ? "" : prefix.trim();
  let next: string;
  if (input.plan.rewrite) {
    next = `${prefix}${written}`;
  } else {
    const joiner = prefix.endsWith("\n") ? "" : "\n\n";
    const rest = said && written.startsWith(said) ? written.slice(said.length).trimStart() : written;
    next = `${prefix}${joiner}${rest}`;
  }
  const open = next.lastIndexOf("<blank>");
  if (open >= 0 && next.indexOf("</blank>", open + "<blank>".length) < 0) next = next.slice(0, open);
  next = next.replace(/\n{3,}/g, "\n\n").trimEnd();
  return { text: next, values: input.values };
}

/** The values a text row holds, made safe for both the client and the server. */
export function parseBlankValues(raw: unknown, defs?: Record<string, BlankDef>): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [key, value] of Object.entries(raw)) {
    if (!isSkinKey(key) || (defs && !Object.hasOwn(defs, key))) continue;
    if (typeof value !== "string") continue;
    const text = value.slice(0, BLANK_MAX_TEXT);
    if (text) out[key] = text;
  }
  return out;
}

/** Whether the hidden answer is non-empty, so a blank draws as filled. */
export const blankFilled = (values: Record<string, string>, key: string): boolean => Boolean(values[key]?.trim());
