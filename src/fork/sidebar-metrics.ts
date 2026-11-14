// Fork: the sidebar's one left line. Measured against the window's traffic lights: the red dot's left edge
// is 16 px in with the frame off, where the sidebar itself owns the corner, and 12 px in with the frame on,
// where the lights sit in WindowFrameBar. Windows has no lights and keeps 16. Every resting item — the
// wordmark, a department's title, a bot's avatar, a group's faces, the account avatar — starts here; a
// selected or hovered surface may reach further left, symmetrically, to wrap its content.

/** The line with the frame off (and on Windows). */
export const SIDEBAR_CONTENT_LEFT = 16;
/** macOS with the frame on: the lights sit 12 px into the window's top bar. */
export const SIDEBAR_CONTENT_LEFT_FRAMED = 12;

/** The list box starts 12 px inside the sidebar, so a row's own padding is the difference. */
export const SIDEBAR_ROW_BOX_LEFT = 12;

/** The wordmark's breathing room: above the mark, and the real distance from its bottom to the first
 * department title's text. Top is 0 for the trial: the top row's own 60px is all the air above it. */
export const SIDEBAR_BRAND_GAP_TOP = 0;
export const SIDEBAR_BRAND_GAP_BOTTOM = 12;

/** What the list already adds above its first section: its own top padding and the title's line box. The
 * brand's bottom padding is the target gap minus these, so the measured distance is 12 in both modes. */
export const SIDEBAR_BRAND_LIST_TOP = 8;
export const SIDEBAR_BRAND_LIST_TOP_SIMPLE = 4;
export const SIDEBAR_SECTION_TITLE_OFFSET = 2;
export const SIDEBAR_SECTION_TITLE_OFFSET_SIMPLE = 8;

/** The list's top padding while the wordmark is shown. */
export function sidebarBrandListTop(simple: boolean): number {
  return simple ? SIDEBAR_BRAND_LIST_TOP_SIMPLE : SIDEBAR_BRAND_LIST_TOP;
}

/** The wordmark wrapper's bottom padding for a real 12px between its ink and the first section's text. */
export function sidebarBrandBottomPadding(simple: boolean): number {
  const titleOffset = simple ? SIDEBAR_SECTION_TITLE_OFFSET_SIMPLE : SIDEBAR_SECTION_TITLE_OFFSET;
  return Math.max(0, SIDEBAR_BRAND_GAP_BOTTOM - sidebarBrandListTop(simple) - titleOffset);
}

/** The left padding a row or a section header adds inside the list box to reach the line. */
export function sidebarRowInset(contentLeft: number): number {
  return Math.max(0, contentLeft - SIDEBAR_ROW_BOX_LEFT);
}
