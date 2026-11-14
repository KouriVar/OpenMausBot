/** One word the person's draft could mean several ways, and the meaning they chose before sending. */
export interface Assumption {
  word: string;
  meaning: string;
}

/** The most words one send may clarify; the composer marks no more. */
export const MAX_ASSUMPTIONS = 3;
export const MAX_ASSUMPTION_TEXT = 120;

/** Strict enough for a server to store and for a client to render: no empty words, no runaway text. */
export function parseAssumptions(value: unknown): Assumption[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: Assumption[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const word = typeof (entry as { word?: unknown }).word === "string" ? (entry as { word: string }).word.trim() : "";
    const meaning = typeof (entry as { meaning?: unknown }).meaning === "string" ? (entry as { meaning: string }).meaning.trim() : "";
    if (!word || !meaning || word.length > MAX_ASSUMPTION_TEXT || meaning.length > MAX_ASSUMPTION_TEXT) continue;
    if (out.some((item) => item.word.toLocaleLowerCase() === word.toLocaleLowerCase())) continue;
    out.push({ word, meaning });
    if (out.length === MAX_ASSUMPTIONS) break;
  }
  return out.length ? out : undefined;
}

/** What the model reads before the person's words: the words, and what they meant here. */
export function assumptionsBlock(assumptions: readonly Assumption[] | undefined): string {
  if (!assumptions?.length) return "";
  const lines = assumptions.map((assumption) => `- "${assumption.word}": ${assumption.meaning}`);
  return `\n\nThe person clarified what these words mean in their message:\n${lines.join("\n")}`;
}
