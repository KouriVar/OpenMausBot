import { FORK_LOCAL_ONLY } from "@/fork/local-only";

/** The collapsed sidebar's column: one 46px box per control, holding one 20px icon.
 *
 * The column's width is the window's traffic lights' own: 14px buttons, 9px apart, from x = 16, so the yellow one is
 * centred on x = 46. 92px wide with 8px of padding leaves the 46px box centred on that same line. */
export const SIDEBAR_ICON_COLUMN_WIDTH = 92;
export const SIDEBAR_ICON_COLUMN_WIDTH_CLASS = "w-[92px]";
export const SIDEBAR_ICON_SIZE = 20;
export const SIDEBAR_ICON_STROKE = 1.75;

/** The 46px control's own size, so the avatar below can be a fraction of it. */
export const SIDEBAR_ICON_BUTTON_SIZE = 46;
/** A bot's avatar in the collapsed column: ~80% of that box, so the face fills the tile (Bloub crops to the body). */
export const SIDEBAR_AVATAR_SIZE = Math.round(SIDEBAR_ICON_BUTTON_SIZE * 0.8);

/** The column's one control, before the colour, hover and focus look each control has of its own. */
export const SIDEBAR_ICON_BUTTON = "flex size-[46px] shrink-0 items-center justify-center rounded-xl";

/** The column's edge as a shadow: a 0.5px border would take 0.5px off the column and pull its centre 0.25px left. */
export const SIDEBAR_ICON_COLUMN_EDGE = "shadow-[inset_-0.5px_0_0_var(--color-edge)]";

/** The fork hides the chief crown and the model/provider badge on the sidebar's bot avatars. */
export const FORK_HIDE_BOT_BADGES = FORK_LOCAL_ONLY;
