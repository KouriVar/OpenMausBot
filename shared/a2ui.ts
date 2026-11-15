export * from "../packages/phone-protocol/src/a2ui.ts";

/** How replies choose a surface: cards always for plans and choices, plain Markdown, or the model's call. */
export const A2UI_OUTPUT_MODES = ["auto", "cards", "markdown"] as const;
export type A2uiOutputMode = (typeof A2UI_OUTPUT_MODES)[number];

export const DEFAULT_A2UI_OUTPUT_MODE: A2uiOutputMode = "auto";

export function a2uiOutputMode(value: unknown): A2uiOutputMode {
  return typeof value === "string" && (A2UI_OUTPUT_MODES as readonly string[]).includes(value)
    ? value as A2uiOutputMode
    : DEFAULT_A2UI_OUTPUT_MODE;
}
