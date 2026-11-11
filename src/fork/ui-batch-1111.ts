// Fork UI batch 2026-11-11: purely presentational. Every change below is switched on by these constants and
// touches no data, no server and no behaviour; flipping a constant back restores the previous look.

export const FORK_UI_1111 = true;

/** The hidden sidebar's edge handle: shorter, fainter, and it springs up under the pointer. Tailwind 4 draws
 * `scale-*` with the `scale` property, so that is what the transition names. */
export const EDGE_HANDLE = "pointer-events-none block h-11 w-1 origin-center rounded-full bg-ink/[0.14] transition-[scale,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-x-150 group-hover:scale-y-110 group-hover:bg-ink/35 group-active:bg-ink/50";
export const EDGE_HANDLE_BEFORE = "pointer-events-none block h-16 w-[5px] rounded-full bg-ink/25 transition-colors duration-150 group-hover:bg-ink/45 group-active:bg-ink/60";

/** Simple's chat-head pill: 4px more on the trailing edge, which the eye reads as even against the ring. */
export const CHATHEAD_PILL_PAD = "py-[7.5px] pl-[7.5px] pr-[11.5px]";
export const CHATHEAD_PILL_PAD_BEFORE = "px-[7.5px] py-[7.5px]";

/** The avatar menu's top line: this installed build's own label and its ui build, so a patched ui is recognisable. */
export const FORK_MENU_BUILD_STAMP = true;
export const MENU_BUILD_STAMP = "px-2 pb-1 pt-1 text-[12px] font-medium leading-4 text-ink-tertiary";

/** The transcript never shows below the composer: the chat pane clips what it draws, and Simple's fade reaches
 * the pane's bottom edge (its composer carries pb-4, which the old -bottom-3 fell 4px short of). The gradient's
 * own colour is the canvas, so every skin and both themes stay right. */
export const FORK_CHAT_PANE_CLIP = true;
export const CHAT_PANE_CLIP = "overflow-hidden";
export const COMPOSER_FADE_BOTTOM_SIMPLE = "-bottom-4";
export const COMPOSER_FADE_BOTTOM = "-bottom-3";

/** The hover row keeps only its buttons: the message's time lives at the foot of its own menu, with a clock. */
export const FORK_MESSAGE_TIME_IN_MENU = true;

/** The avatar menu keeps only what this build uses: no phone-app row, no support submenu, no place switcher. */
export const FORK_PROFILE_MENU_MINIMAL = true;

/** The message's actions live in a right-click menu now: the bubble shows no hover buttons, and the menu opens
 * anywhere on it with the reactions on top. */
export const FORK_MESSAGE_MENU_ON_RIGHT_CLICK = true;
