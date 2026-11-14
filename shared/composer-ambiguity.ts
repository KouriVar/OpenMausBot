import type { SkinSpec } from "../packages/phone-protocol/src/skins.ts";

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
  /** Kept for a reader older than the skin field: the same choice in three words. */
  control: AmbiguityControl;
  options: AmbiguityOption[];
  /** The control the panel draws: the same option data as every other place. */
  skin?: SkinSpec;
}

/** The fixed quick model for the composer's background pass; change it here when the fast model changes. */
export const AMBIGUITY_FAST_MODEL = "auto/deepseek-v4.1-flash[1m]";

export const AMBIGUITY_MAX_WORDS = 3;
export const AMBIGUITY_MAX_TEXT = 2_000;
export const AMBIGUITY_TIMEOUT_MS = 5_000;

export const AMBIGUITY_TOKENS: readonly AmbiguityToken[] = ["accent", "success", "warning", "danger", "ink"];
