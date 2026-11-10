import { Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SidebarDensity } from "@/lib/sidebar-preferences";
import type { Bot } from "@/state/store";
import { useForkAvatarStyle } from "@/fork/avatar-style";
import { useBloubSkin } from "@/fork/bloub-skin";
import { SIDEBAR_AVATAR_ADVANCED } from "./sidebar-icon-column";
import { BotAvatar } from "./Avatar";
import { BloubAvatar } from "./BloubAvatar";
import { GroupFaceCluster, clusterFaceSize, type GroupFaceClusterLayout } from "./GroupFaceStack";
import { FORK_UI_1110 } from "@/fork/ui-batch-1110";
import { GROUP_AVATAR_SCALE } from "@/fork/ui-batch-1110b";

/** One member in the stack, in its own Bloub look, drawn to the edge of its face so the cut ring never
 * leaves a see-through gap over the face it covers. */
function BloubMember({ bot, size }: { bot: Bot; size: number }) {
  const skin = useBloubSkin(bot.id, bot.color);
  return <BloubAvatar size={size} frameSize={size} fitBody shape={skin.shape} colorId={skin.color} expression={skin.expression} state="idle" animated={false} label={bot.name} />;
}

export function StackedMauses({ members, density, large = false, surface = "var(--row, var(--color-panel))" }: {
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
  // A group fills the square a single face would take: two members corner to corner, three as a pyramid, four
  // or more as the first four in a 2x2 whose faces ride over one another. No count tail — the row already
  // names the room.
  const layout: GroupFaceClusterLayout = FORK_UI_1110
    ? members.length === 2 ? "pair" : members.length === 3 ? "triad" : "quad"
    : members.length === 2 ? "pair" : "triad";
  // The whole group draws larger than a single face's slot; the row's own box keeps its size, so the
  // cluster is centred in it and the selected/hover square stays exactly the single bot's.
  const square = Math.round((iconOnly ? 48 : large ? 36 : 32) * GROUP_AVATAR_SCALE);
  const face = clusterFaceSize(square, layout);
  const shown = members.slice(0, layout === "quad" ? 4 : layout === "triad" ? 3 : 2);
  return (
    <div className={cn("flex shrink-0 items-center justify-center", slotSize)}>
      <GroupFaceCluster
        layout={layout}
        size={square}
        surface={surface}
        ringWidth={2 * GROUP_AVATAR_SCALE}
        faces={shown.map((b) => (bloub
          ? <BloubMember key={b.id} bot={b} size={face} />
          : <BotAvatar key={b.id} bot={b} state="happy" size={face} animated={false} />))}
      />
    </div>
  );
}
