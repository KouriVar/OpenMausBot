// One conversation's interactive answers, from features.interactiveAnswers: which card tools its agents server lists.
// The prompt text lives in system-prompt.ts, which this module must not pull in: the in-box agents proxy bundles it.
import { isInteractiveAnswerMode, type InteractiveAnswerMode } from "../shared/interactive-answers.ts";

/** The tier in the environment of a turn's agents server. */
export const INTERACTIVE_ANSWERS_ENV = "OMB_INTERACTIVE_ANSWERS";

/** No tier stated, by a harness older than the setting or a hand-built profile, reads as the whole card set: a tier
 * nobody asked for would take a tool away from a conversation that already lists it. */
export const UNTIERED_INTERACTIVE_ANSWERS: InteractiveAnswerMode = "widgets+html";

/** The card tools a tier leaves out. publish_page and unpublish_page are not cards: they stay listed at every tier. */
const CARDS_LEFT_OUT: Record<InteractiveAnswerMode, ReadonlySet<string>> = {
  off: new Set(["show_widget", "show_html"]),
  widgets: new Set(["show_html"]),
  "widgets+html": new Set(),
};

export function interactiveAnswersFromEnv(env: Record<string, string | undefined> = process.env): InteractiveAnswerMode {
  const tier = env[INTERACTIVE_ANSWERS_ENV];
  return isInteractiveAnswerMode(tier) ? tier : UNTIERED_INTERACTIVE_ANSWERS;
}

/** `tools` in catalog order without the cards this tier cannot post. */
export function toolListForInteractiveAnswers<T extends { name: string }>(tools: readonly T[], mode: InteractiveAnswerMode): T[] {
  const leftOut = CARDS_LEFT_OUT[mode];
  return leftOut.size === 0 ? [...tools] : tools.filter((tool) => !leftOut.has(tool.name));
}
