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

/** The wordmark's breathing room: above the mark and between it and the first section. */
export const SIDEBAR_BRAND_GAP_TOP = 20;
export const SIDEBAR_BRAND_GAP_BOTTOM = 20;

/** The left padding a row or a section header adds inside the list box to reach the line. */
export function sidebarRowInset(contentLeft: number): number {
  return Math.max(0, contentLeft - SIDEBAR_ROW_BOX_LEFT);
}
