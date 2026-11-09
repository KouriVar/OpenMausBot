/** The collapsed sidebar's column: one 46px box per control, holding one 20px icon.
 *
 * The column's width is the window's traffic lights' own: 14px buttons, 9px apart, from x = 16, so the yellow one is
 * centred on x = 46. 92px wide with 8px of padding leaves the 46px box centred on that same line. */
export const SIDEBAR_ICON_COLUMN_WIDTH = 92;
export const SIDEBAR_ICON_COLUMN_WIDTH_CLASS = "w-[92px]";
export const SIDEBAR_ICON_SIZE = 20;
export const SIDEBAR_ICON_STROKE = 1.75;

/** The column's one control, before the colour, hover and focus look each control has of its own. */
export const SIDEBAR_ICON_BUTTON = "flex size-[46px] shrink-0 items-center justify-center rounded-xl";

/** The column's edge as a shadow: a 0.5px border would take 0.5px off the column and pull its centre 0.25px left. */
export const SIDEBAR_ICON_COLUMN_EDGE = "shadow-[inset_-0.5px_0_0_var(--color-edge)]";
