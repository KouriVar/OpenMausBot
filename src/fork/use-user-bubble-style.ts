import { useMemo, type CSSProperties } from "react";

import type { Bot } from "@/state/store";
import { useColorScheme } from "@/lib/color-scheme";
import { userBubbleStyle, userBubbleStyleHex } from "@/lib/user-bubble-tone";
import { bloubMid } from "./bloub-skin";
import { useForkAvatarStyle } from "./avatar-style";
import { useBloubSkin } from "./bloub-skin";

/** The one colour a bot's Bloub avatar paints, as every surface that belongs to that bot takes it: the
 * sidebar row, the header pill, your bubble and the composer's voice and Send buttons. It reads the
 * same `omb.fork.bloub.<id>` record the avatar does and re-reads on every save, so a new avatar colour
 * reaches all of them without a reload. `undefined` while the fork draws the MausBot mascot instead. */
export function useBloubAccent(bot: { id?: string; color?: string }): string | undefined {
  const forkBloub = useForkAvatarStyle() === "bloub";
  const skin = useBloubSkin(bot.id, bot.color);
  const scheme = useColorScheme();
  return useMemo(() => (forkBloub ? bloubMid(skin.color, scheme) : undefined), [forkBloub, skin.color, scheme]);
}

/** Fork: a white avatar (Bloub "black" in dark mode paints #FFFFFF→#C2C2C2) makes your bubble dark grey
 * instead of following that near-white accent, which used to leave it light grey on a dark canvas. */
export const FORK_WHITE_BUBBLE = true;
export const WHITE_BUBBLE_BG = "#3B3B3B";
export const WHITE_BUBBLE_INK = "#F5F5F5";

/** True when an accent is near-white, so the bubble and the composer's voice buttons can go grey. */
export function isWhiteAccent(hex: string | undefined): boolean {
  if (!hex) return false;
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return false;
  const n = Number.parseInt(match[1]!, 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 0xff, n & 0xff];
  // Perceived lightness: only a near-white avatar takes the dark grey.
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.82;
}

/** Your bubble: with Bloub on, the bot's Bloub colour (neutral in a group chat); otherwise the old
 * "colour my messages" rule. The bubble takes the middle of the Bot's gradient (per theme) so the text
 * contrast is measured against the colour that actually shows. */
export function useUserBubbleStyle({ bot, advanced, colorMine, sharedChat }: {
  bot: Bot;
  advanced: boolean;
  colorMine: boolean;
  sharedChat: boolean;
}): CSSProperties | undefined {
  const forkBloub = useForkAvatarStyle() === "bloub";
  const accent = useBloubAccent(bot);
  const scheme = useColorScheme();
  return useMemo(() => {
    if (forkBloub) {
      if (sharedChat) return undefined;
      // A white avatar in dark mode: the inline accent style would beat any stylesheet rule, so the
      // override belongs here, where the bubble's own variables are set.
      if (FORK_WHITE_BUBBLE && scheme === "dark" && isWhiteAccent(accent)) {
        return {
          "--color-bubble-user": WHITE_BUBBLE_BG,
          "--color-bubble-user-ink": WHITE_BUBBLE_INK,
          // The bubble's own text uses text-ink, so the ink variables inside it move together.
          "--color-ink": WHITE_BUBBLE_INK,
          "--color-ink-secondary": `color-mix(in srgb, ${WHITE_BUBBLE_INK} 72%, transparent)`,
          "--color-ink-tertiary": `color-mix(in srgb, ${WHITE_BUBBLE_INK} 52%, transparent)`,
        } as CSSProperties;
      }
      return accent ? userBubbleStyleHex(accent, { flat: !advanced }) : undefined;
    }
    return colorMine ? userBubbleStyle(bot.color, { flat: !advanced }) : undefined;
  }, [forkBloub, sharedChat, accent, scheme, colorMine, bot.color, advanced]);
}
