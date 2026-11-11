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
