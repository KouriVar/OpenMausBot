import type { WidgetNode } from "./widget.ts";

/** A MultiSelect's comma-separated values, checked against its options; a string is the refusal. */
export function multiSelectAnswer(node: WidgetNode, label: string, value: string): { kept: string; shown: string } | string {
  const picked = value.split(",").map((part) => part.trim()).filter(Boolean);
  const options = Array.isArray(node.options) ? node.options as Array<{ label: string; value: string }> : [];
  const labels = picked.map((pickedValue) => options.find((candidate) => candidate.value === pickedValue)?.label);
  if (!picked.length || labels.some((entry) => entry === undefined)) return `${label} must be one or more of the offered options.`;
  return { kept: picked.join(","), shown: labels.join(", ") };
}
