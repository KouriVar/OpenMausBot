// How a bot's reply may carry components, as features.interactiveAnswers in
// config.json holds it: nothing, the component tree only, or the component
// tree plus the show_html page tool.
export const INTERACTIVE_ANSWER_MODES = ["off", "widgets", "widgets+html"] as const;

export type InteractiveAnswerMode = (typeof INTERACTIVE_ANSWER_MODES)[number];

/** What a config without the setting reads as. */
export const DEFAULT_INTERACTIVE_ANSWER_MODE: InteractiveAnswerMode = "widgets";

/** The fence a reply puts a component in, where the component belongs in the
 * text. Its body is the same tree show_widget takes, so one normaliser and one
 * renderer serve both. */
export const COMPONENT_FENCE_TAG = "omb-ui";

export function isInteractiveAnswerMode(value: unknown): value is InteractiveAnswerMode {
  return typeof value === "string" && (INTERACTIVE_ANSWER_MODES as readonly string[]).includes(value);
}

export function interactiveAnswerMode(value: unknown): InteractiveAnswerMode {
  return isInteractiveAnswerMode(value) ? value : DEFAULT_INTERACTIVE_ANSWER_MODE;
}

/** Component fences in a reply are drawn as components; off leaves them as plain code. */
export function showsComponentFences(mode: InteractiveAnswerMode): boolean {
  return mode !== "off";
}

/** Only the widest setting mounts show_html; the component tools stop there. */
export function allowsHtmlPages(mode: InteractiveAnswerMode): boolean {
  return mode === "widgets+html";
}
