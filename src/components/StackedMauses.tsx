import { Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SidebarDensity } from "@/lib/sidebar-preferences";
import type { Bot } from "@/state/store";
import { useForkAvatarStyle } from "@/fork/avatar-style";
import { useBloubSkin } from "@/fork/bloub-skin";
import { SIDEBAR_AVATAR_ADVANCED } from "./sidebar-icon-column";
import { BotAvatar } from "./Avatar";
import { BloubAvatar } from "./BloubAvatar";

/** One member in the 2×2 grid, in its own Bloub look. */
function BloubMember({ bot, size }: { bot: Bot; size: number }) {
  const skin = useBloubSkin(bot.id, bot.color);
  return <BloubAvatar size={size} shape={skin.shape} colorId={skin.color} expression={skin.expression} state="idle" animated={false} label={bot.name} />;
}

export function StackedMauses({ members, density, large = false }: { members: Bot[]; density: SidebarDensity; large?: boolean }) {
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
  // The fork draws a group as a 2×2 of its members' own Bloub faces, filling the same square as one avatar.
  if (bloub) {
    const gap = 1.5;
    const cell = Math.max(10, (singleSize - gap) / 2);
    const shown = members.slice(0, 4);
    return (
      <div className={cn("flex shrink-0 items-center justify-center", slotSize)}>
        <div data-bloub-group="" style={{ width: singleSize, height: singleSize, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap }}>
          {shown.map((b) => <BloubMember key={b.id} bot={b} size={cell} />)}
          {Array.from({ length: 4 - shown.length }, (_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
        </div>
      </div>
    );
  }
  const shown = members.slice(0, 2);
  const extra = members.length - shown.length;
  return (
    <div className={cn("flex shrink-0 items-center justify-center", slotSize)}>
      <div className="flex items-center -space-x-2.5">
        {shown.map((b) => (
          <BotAvatar key={b.id} bot={b} state="happy" size={iconOnly ? 30 : large ? 26 : 20} animated={false} />
        ))}
        {extra > 0 && (
          <span className="z-10 flex size-4 items-center justify-center rounded-full border border-hairline/40 bg-raised text-[9px] font-medium text-ink-secondary">
            +{extra}
          </span>
        )}
      </div>
    </div>
  );
}
