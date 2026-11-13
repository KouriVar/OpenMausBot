// Fork: the one place a department's lead mark is drawn. A Chief shows a crown; a department lead walks the same
// feature with a flag instead. Swap the SVG in CHIEF_MARKS and every badge follows — sidebar rows, the chat header, the
// team map, the org chart, the bot menu and the settings card all read it from here.
import type { LucideIcon } from "lucide-react";

import { Crown, Flag } from "@/lib/icons";

/** Which mark a Chief's bot shows. Both are the Chief feature; only the drawing differs. */
export type ChiefStyle = "crown" | "lead";
export const DEFAULT_CHIEF_STYLE: ChiefStyle = "crown";
export const CHIEF_STYLES: readonly ChiefStyle[] = ["crown", "lead"];

/** The two marks, both from the app's icon set (Remix Icon behind lucide's contract). */
export const CHIEF_MARKS: Record<ChiefStyle, LucideIcon> = { crown: Crown, lead: Flag };

export const isChiefStyle = (value: unknown): value is ChiefStyle => value === "crown" || value === "lead";

export function chiefMark(style: ChiefStyle = DEFAULT_CHIEF_STYLE): LucideIcon {
  return CHIEF_MARKS[style] ?? CHIEF_MARKS[DEFAULT_CHIEF_STYLE];
}
