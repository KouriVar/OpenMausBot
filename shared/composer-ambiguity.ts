/** A word in the composer that could mean more than one thing, and the meanings offered for it. */
export type AmbiguityControl = "options" | "slider" | "swatch";
export type AmbiguityToken = "accent" | "success" | "warning" | "danger" | "ink";

export interface AmbiguityOption {
  label: string;
  token?: AmbiguityToken;
}

export interface AmbiguityMark {
  word: string;
  start: number;
  end: number;
  control: AmbiguityControl;
  options: AmbiguityOption[];
}

/** The fixed quick model for the composer's background pass; change it here when the fast model changes. */
export const AMBIGUITY_FAST_MODEL = "auto/deepseek-v4.1-flash[1m]";

export const AMBIGUITY_MAX_WORDS = 3;
export const AMBIGUITY_MAX_TEXT = 2_000;
export const AMBIGUITY_TIMEOUT_MS = 5_000;

export const AMBIGUITY_TOKENS: readonly AmbiguityToken[] = ["accent", "success", "warning", "danger", "ink"];
