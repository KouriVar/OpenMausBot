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
  return useMemo(() => {
    if (forkBloub) {
      if (sharedChat) return undefined;
      return accent ? userBubbleStyleHex(accent, { flat: !advanced }) : undefined;
    }
    return colorMine ? userBubbleStyle(bot.color, { flat: !advanced }) : undefined;
  }, [forkBloub, sharedChat, accent, colorMine, bot.color, advanced]);
}
