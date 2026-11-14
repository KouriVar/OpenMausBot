import { AMBIGUITY_MAX_WORDS, AMBIGUITY_TOKENS, type AmbiguityControl, type AmbiguityMark, type AmbiguityOption } from "../shared/composer-ambiguity.ts";

const CONTROL: readonly AmbiguityControl[] = ["options", "slider", "swatch"];

export function ambiguityPrompt(text: string): string {
  return `Read this unsent message. Find at most ${AMBIGUITY_MAX_WORDS} words or short phrases whose meaning is genuinely ambiguous here, and for each give 2 to 4 concrete meanings. Choose the control that fits those meanings: "options" for a list, "slider" for an ordered scale, "swatch" for colour-like meanings. Return only JSON, no prose:
{"terms":[{"word":"the exact words from the message","control":"options|slider|swatch","meanings":[{"label":"short meaning","token":"accent|success|warning|danger|ink"}]}]}
Use token only for swatch. Keep each label under 40 characters. Use the message's language. If nothing is ambiguous, return {"terms":[]}.

Message:
${text}`;
}

function clean(value: unknown, limit = 60): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function parseMeanings(raw: unknown, control: AmbiguityControl): { options: AmbiguityOption[]; control: AmbiguityControl } {
  if (!Array.isArray(raw)) return { options: [], control };
  const seen = new Set<string>();
  const options: AmbiguityOption[] = [];
  let swatches = control === "swatch";
  for (const entry of raw) {
    const label = clean(typeof entry === "string" ? entry : entry && typeof entry === "object" ? (entry as { label?: unknown }).label : undefined);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    const token = entry && typeof entry === "object" ? (entry as { token?: unknown }).token : undefined;
    if (swatches && (typeof token !== "string" || !AMBIGUITY_TOKENS.includes(token as never))) swatches = false;
    options.push({ label, ...(typeof token === "string" && AMBIGUITY_TOKENS.includes(token as never) ? { token: token as AmbiguityOption["token"] } : {}) });
    if (options.length === 4) break;
  }
  if (options.length < 2) return { options: [], control };
  return swatches ? { options, control: "swatch" } : { options: options.map(({ token: _token, ...option }) => option), control: control === "swatch" ? "options" : control };
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
    const term = raw as { word?: unknown; control?: unknown; meanings?: unknown };
    const word = clean(term.word, 80);
    if (!word || seen.has(word.toLocaleLowerCase())) continue;
    const located = locate(draft, word);
    if (!located) continue;
    const asked = typeof term.control === "string" && CONTROL.includes(term.control as AmbiguityControl) ? term.control as AmbiguityControl : "options";
    const parsedMeanings = parseMeanings(term.meanings, asked);
    if (!parsedMeanings.options.length) continue;
    seen.add(word.toLocaleLowerCase());
    marks.push({ word: draft.slice(located.start, located.end), ...located, control: parsedMeanings.control, options: parsedMeanings.options });
    if (marks.length === AMBIGUITY_MAX_WORDS) break;
  }
  return marks;
}
