import { COMPONENT_FENCE_TAG } from "../../shared/interactive-answers";
import { parseWidgetInput, type WidgetRoot } from "../../shared/widget";

/** A finished component fence's body as the tree it holds, or why the reply shows it as code instead. */
export type OmbUiFence =
  | { ok: true; root: WidgetRoot }
  | { ok: false; error: string };

/** Whether a fence's info string names the component fence: "omb-ui", in any case. */
export function isOmbUiFence(info: string): boolean {
  return info.trim().toLowerCase() === COMPONENT_FENCE_TAG;
}

export function parseOmbUiFence(body: string): OmbUiFence {
  try {
    const parsed = parseWidgetInput(body.trim());
    return parsed.ok ? { ok: true, root: parsed.value } : { ok: false, error: parsed.error };
  } catch {
    // A fence is model output: a body the parser cannot take is drawn as code, never as a failed render.
    return { ok: false, error: "widget: could not be read." };
  }
}
