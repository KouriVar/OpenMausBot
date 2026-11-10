// Fork UI batch 2026-11-10 B: presentational only. Every change is switched on here; turning a constant off
// restores the previous look. No data, server or behaviour changes.
export const FORK_UI_1110B = true;

/** The MCP page's Claude Code switches and its trust notice are hidden (the settings values stay as they are). */
export const HIDE_CLAUDE_CODE_MCP = FORK_UI_1110B;

/** The composer's bottom edge fades out the way the chat head fades in its top. */
export const COMPOSER_BOTTOM_FADE = FORK_UI_1110B;

/** Simple's collapsed rail moves inbox/search/new/plugins into the profile menu. */
export const RAIL_ACTIONS_IN_MENU = FORK_UI_1110B;

/** Group avatars in the sidebar draw 1.2x larger inside the same row slot: faces, overlap and rings scale. */
export const GROUP_AVATAR_SCALE = 1.2;

/** Simple's expanded footer carries search, inbox and + on the avatar's row instead of the header. */
export const FOOTER_ACTIONS = true;
