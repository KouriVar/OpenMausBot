import {
  AMBIGUITY_MAX_WORDS, AMBIGUITY_TOKENS, type AmbiguityControl, type AmbiguityMark, type AmbiguityOption, type AmbiguityToken,
} from "../shared/composer-ambiguity.ts";
import { parseSkin, type SkinOption, type SkinUi } from "../packages/phone-protocol/src/skins.ts";

const CONTROL: readonly AmbiguityControl[] = ["options", "slider", "swatch"];

export function ambiguityPrompt(text: string): string {
  return `Read this unsent message. Find at most ${AMBIGUITY_MAX_WORDS} words or short phrases whose meaning is genuinely ambiguous here, and for each give 2 to 4 concrete meanings. Choose the control that fits those meanings, by meaning rather than by habit: a date → dates; a time of day → time; a place → map with lat and lng on each option; a colour → swatches with hex; a font → fonts with font; a layout → layouts with layout; yes or no → toggle; a range or budget → range with min, max, step and unit; a quantity, degree or level → slider; two dimensions at once → pad with axes and cells; a position → grid with nine options; a style or tone → samples with a sample sentence; a mood or reaction → emoji; only then list. Plain text chips are the fallback, not the default. Return only JSON, no prose:
{"terms":[{"word":"the exact words from the message","ui":"list|samples|swatches|fonts|thumbs|slider|range|dates|time|emoji|toggle|grid|pad|layouts|map","options":[{"label":"short meaning","sample":"one example sentence","hex":"#aabbcc","font":"a system font name","icon":"an emoji","lat":0,"lng":0,"layout":"hero|split|stack|sidebar|gallery|cards|list|magazine|poster"}],"multi":true,"min":0,"max":100,"step":1,"unit":"元","axes":{"x":{"label":"语气","start":"轻松","end":"正式"},"y":{"label":"长短","start":"一句话","end":"一段话"}},"cells":["轻松的一句话"]}]}
Use hex only on swatches. Keep each label under 40 characters. Use the message's language. Dates and times need no options. If nothing is ambiguous, return {"terms":[]}.

Message:
${text}`;
}

function clean(value: unknown, limit = 60): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

const UI_FROM_CONTROL: Record<AmbiguityControl, SkinUi> = { options: "list", slider: "slider", swatch: "swatches" };

function legacyOptions(options: readonly SkinOption[], tokens: readonly (string | undefined)[]): AmbiguityOption[] {
  return options.map((option, index) => {
    const token = tokens[index];
    return { label: option.label, ...(typeof token === "string" && AMBIGUITY_TOKENS.includes(token as never) ? { token: token as AmbiguityToken } : {}) };
  });
}

/** The model's meanings as one skin. A malformed skin is not marked at all. */
function parseMeanings(raw: unknown, term: Record<string, unknown>): { options: AmbiguityOption[]; control: AmbiguityControl; skin: ReturnType<typeof parseSkin> } | null {
  const list = Array.isArray(raw) ? raw : [];
  const tokens = list.map((entry) => entry && typeof entry === "object" ? (entry as { token?: unknown }).token : undefined) as Array<string | undefined>;
  const options = list.flatMap((entry) => {
    if (typeof entry === "string") return [{ label: entry.trim(), sample: undefined }];
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    return [{ ...record, label: clean(record.label) || clean(record.value) }];
  }).filter((entry) => entry.label).slice(0, 4);
  const control = typeof term.control === "string" && CONTROL.includes(term.control as AmbiguityControl)
    ? term.control as AmbiguityControl
    : "options";
  const asked = term.ui ?? UI_FROM_CONTROL[control];
  const skin = parseSkin({ ...term, ui: asked, options }, "list");
  const allowsEmpty = skin.ui === "dates" || skin.ui === "time";
  const numeric = skin.min !== undefined && skin.max !== undefined && skin.max > skin.min;
  if (!allowsEmpty && skin.options.length < 2 && !((skin.ui === "slider" || skin.ui === "range") && numeric)) return null;
  const nextControl: AmbiguityControl = skin.ui === "slider" || skin.ui === "range" ? "slider" : skin.ui === "swatches" ? "swatch" : "options";
  return { options: legacyOptions(skin.options, tokens), control: nextControl, skin };
}

function locate(text: string, word: string): { start: number; end: number } | null {
  const at = text.toLocaleLowerCase().indexOf(word.toLocaleLowerCase());
  return at < 0 ? null : { start: at, end: at + word.length };
}

/** The model's answer as marks anchored in the draft; anything malformed is simply not marked. */
export function parseAmbiguityAnswer(answer: string, draft: string): AmbiguityMark[] {
  const trimmed = answer.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return [];
  }
  const terms = parsed && typeof parsed === "object" && Array.isArray((parsed as { terms?: unknown }).terms) ? (parsed as { terms: unknown[] }).terms : [];
  const marks: AmbiguityMark[] = [];
  const seen = new Set<string>();
  for (const raw of terms) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const term = raw as Record<string, unknown>;
    const word = clean(term.word, 80);
    if (!word || seen.has(word.toLocaleLowerCase())) continue;
    const located = locate(draft, word);
    if (!located) continue;
    const meanings = parseMeanings(term.options ?? term.meanings, term);
    if (!meanings) continue;
    seen.add(word.toLocaleLowerCase());
    marks.push({
      word: draft.slice(located.start, located.end), ...located,
      control: meanings.control, options: meanings.options, skin: meanings.skin,
    });
    if (marks.length === AMBIGUITY_MAX_WORDS) break;
  }
  return marks;
}
