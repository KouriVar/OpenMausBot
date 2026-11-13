/** Fork: the Settings window never changes this fork's interface mode.
 *
 * Upstream's one-window Settings turns Advanced on when a link, a notice or a search result asks for a page or row only
 * Advanced shows. That presumes upstream's visible Advanced switch, and this fork has none: the switch sits behind the
 * ten-tap unlock, and Advanced draws a different bot side panel from the one the chat head opens. A promotion made here
 * would swap that panel for Advanced's settings list and leave no way back. The requested page still opens, with the
 * rows Simple has. */
export const FORK_SETTINGS_KEEPS_MODE = true;
