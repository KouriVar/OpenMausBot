import { Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SidebarDensity } from "@/lib/sidebar-preferences";
import type { Bot } from "@/state/store";
import { useForkAvatarStyle } from "@/fork/avatar-style";
import { useBloubSkin } from "@/fork/bloub-skin";
import { SIDEBAR_AVATAR_ADVANCED } from "./sidebar-icon-column";
import { BotAvatar } from "./Avatar";
import { BloubAvatar } from "./BloubAvatar";
import { GroupFaceStack } from "./GroupFaceStack";

/** One member in the stack, in its own Bloub look, drawn to the edge of its face so the cut ring never
 * leaves a see-through gap over the face it covers. */
function BloubMember({ bot, size }: { bot: Bot; size: number }) {
  const skin = useBloubSkin(bot.id, bot.color);
  return <BloubAvatar size={size} frameSize={size} fitBody shape={skin.shape} colorId={skin.color} expression={skin.expression} state="idle" animated={false} label={bot.name} />;
}

export function StackedMauses({ members, density, large = false, surface = "var(--color-panel)" }: {
  members: Bot[];
  density: SidebarDensity;
  large?: boolean;
  /** The row's own background, so each face's disc and ring cut the face beneath. */
  surface?: string;
}) {
  const bloub = useForkAvatarStyle() === "bloub";
  const iconOnly = density === "icons";
  const slotSize = iconOnly ? "size-12" : large ? "size-9" : "size-8";
  const singleSize = bloub ? (iconOnly ? SIDEBAR_AVATAR_ADVANCED : large ? 36 : 32) : iconOnly ? 44 : large ? 36 : 32;
  if (members.length <= 1) {
    const b = members[0];
    return (
      <div className={cn("flex shrink-0 items-center justify-center", slotSize)}>
        {b ? <BotAvatar bot={b} state="happy" size={singleSize} animated={false} /> : <Users size={24} className="text-ink-secondary" />}
      </div>
    );
  }
  // A group is its members' own faces in Grok's stack, sized to the square a single face would take: the
  // comfortable row fits two, the taller simple row and the collapsed rail fit three.
  const face = iconOnly ? 26 : large ? 24 : 20;
  const shown = members.slice(0, iconOnly ? 3 : 2);
  return (
    <div className={cn("flex shrink-0 items-center justify-center", slotSize)}>
      <GroupFaceStack
        face={face}
        overlap={Math.round(face * 0.48)}
        surface={surface}
        total={members.length}
        faces={shown.map((b) => (bloub
          ? <BloubMember key={b.id} bot={b} size={face} />
          : <BotAvatar key={b.id} bot={b} state="happy" size={face} animated={false} />))}
      />
    </div>
  );
}
