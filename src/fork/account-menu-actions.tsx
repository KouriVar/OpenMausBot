import { Archive, Bot as BotIcon, FolderPlus, LayoutTemplate, MessageSquarePlus, Plus, Search, SquarePen, Users } from "lucide-react";

import type { SidebarMenuItem } from "@/components/SidebarPopoverMenu";
import { t } from "@/lib/i18n";

/** The account menu's first two rows: search, and everything the footer's + used to open. */
export function sidebarAccountMenuActions({
  advanced,
  remote,
  plusBotName,
  canAddBot,
  teamLibrary,
  archivedCount,
  onSearch,
  onNewChat,
  onNewThread,
  onNewBot,
  onNewChannel,
  onNewTeam,
  onTeamLibrary,
  onArchived,
}: {
  advanced: boolean;
  remote: boolean;
  plusBotName?: string;
  canAddBot: boolean;
  teamLibrary: boolean;
  archivedCount: number;
  onSearch: () => void;
  onNewChat: () => void;
  onNewThread: () => void;
  onNewBot: () => void;
  onNewChannel: () => void;
  onNewTeam: () => void;
  onTeamLibrary: () => void;
  onArchived: () => void;
}): SidebarMenuItem[] {
  return [
    { key: "account-search", label: t("sidebar.searchAria"), icon: <Search size={16} />, onSelect: onSearch },
    {
      key: "account-new",
      label: remote ? t("sidebar.new") : t("sidebar.newOrShare"),
      icon: <Plus size={16} />,
      submenu: [
        ...(advanced
          ? [{ key: "account-new-chat", label: t("sidebar.newChat.title"), icon: <MessageSquarePlus size={16} />, onSelect: onNewChat }]
          : plusBotName
            ? [{ key: "account-new-thread", label: t("sidebar.newConversationWith", { name: plusBotName }), icon: <SquarePen size={16} />, onSelect: onNewThread }]
            : []),
        ...(canAddBot
          ? [{ key: "account-new-bot", label: t(advanced ? "sidebar.newBot" : "sidebar.newBotSimple"), icon: <BotIcon size={16} />, onSelect: onNewBot }]
          : []),
        { key: "account-new-channel", label: t("sidebar.newChannel.title"), icon: <Users size={16} />, onSelect: onNewChannel },
        ...(advanced && !remote && canAddBot
          ? [{ key: "account-new-team", label: t("team.create"), icon: <FolderPlus size={16} />, onSelect: onNewTeam }]
          : []),
        ...(teamLibrary
          ? [{ key: "account-team-library", label: t("sidebar.teamLibrary"), icon: <LayoutTemplate size={16} />, onSelect: onTeamLibrary }]
          : []),
        ...(advanced && archivedCount > 0
          ? [{ key: "account-archived", label: t("sidebar.archived.title"), icon: <Archive size={16} />, onSelect: onArchived }]
          : []),
      ],
      onSelect: () => {},
    },
  ];
}
