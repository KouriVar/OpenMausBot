import { useMemo, type CSSProperties } from "react";

import type { Bot } from "@/state/store";
import { useColorScheme } from "@/lib/color-scheme";
import { userBubbleStyle, userBubbleStyleHex } from "@/lib/user-bubble-tone";
import { bloubMid } from "./bloub-skin";
import { useForkAvatarStyle } from "./avatar-style";
import { useBloubSkin } from "./bloub-skin";

/** Your bubble: with Bloub on, the bot's Bloub colour (neutral in a group chat); otherwise the old
 * "colour my messages" rule. The bubble uses the middle of the Bot's gradient (per theme) so the text
 * contrast is measured against the colour that actually shows. */
export function useUserBubbleStyle({ bot, advanced, colorMine, sharedChat }: {
  bot: Bot;
  advanced: boolean;
  colorMine: boolean;
  sharedChat: boolean;
}): CSSProperties | undefined {
  const forkBloub = useForkAvatarStyle() === "bloub";
  const skin = useBloubSkin(bot.id, bot.color);
  const scheme = useColorScheme();
  return useMemo(() => {
    if (forkBloub) {
      if (sharedChat) return undefined;
      const hex = bloubMid(skin.color, scheme);
      return hex ? userBubbleStyleHex(hex, { flat: !advanced }) : undefined;
    }
    return colorMine ? userBubbleStyle(bot.color, { flat: !advanced }) : undefined;
  }, [forkBloub, sharedChat, skin.color, scheme, colorMine, bot.color, advanced]);
}
