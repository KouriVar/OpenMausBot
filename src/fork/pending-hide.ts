import { createContext, useSyncExternalStore } from "react";
import type { LocaleKey } from "@/locales";

/** The排查 page's catalog: every entry a person can stop drawing, and where it lives. Nothing here changes a
 * default: an entry is shown unless this device's `omb.pendingHide` says otherwise. */

export type PendingHideId =
  | "sidebarPublishedApps" | "sidebarTeamMap" | "sidebarPhone"
  | "menuInbox" | "menuTeam" | "menuPublishedApps"
  | "chatShare" | "chatInspector"
  | "composerGoal" | "composerTeach" | "composerCall"
  | "groupCall"
  | "panelCloud" | "panelVm" | "panelVps" | "panelSimular" | "panelShared"
  | "panelAndroid" | "panelPhoneScreen" | "panelWebhooks" | "panelTeamChief" | "panelVisibility"
  | "automationsWebhooks" | "automationsAppTriggers" | "automationsLimitResets" | "automationsDigests"
  | "chatAnnouncements" | "chatSetupOffer" | "chatBrief" | "chatPublishedPage"
  | "appsEmail" | "appsX" | "appsPostiz" | "appsHostedMcp" | "appsTeamLibrary";

export interface PendingArea {
  id: string;
  labelKey: LocaleKey;
}

export interface PendingEntry {
  id: PendingHideId;
  area: string;
  labelKey: LocaleKey;
}

export const PENDING_AREAS: readonly PendingArea[] = [
  { id: "sidebar", labelKey: "pending.area.sidebar" },
  { id: "menu", labelKey: "pending.area.menu" },
  { id: "chatMenu", labelKey: "pending.area.chatMenu" },
  { id: "composer", labelKey: "pending.area.composer" },
  { id: "call", labelKey: "pending.area.call" },
  { id: "group", labelKey: "pending.area.group" },
  { id: "botPanel", labelKey: "pending.area.botPanel" },
  { id: "automations", labelKey: "pending.area.automations" },
  { id: "chatCards", labelKey: "pending.area.chatCards" },
  { id: "appsPanel", labelKey: "pending.area.appsPanel" },
];

export const PENDING_ENTRIES: readonly PendingEntry[] = [
  { id: "sidebarPublishedApps", area: "sidebar", labelKey: "pending.entry.sidebarPublishedApps" },
  { id: "sidebarTeamMap", area: "sidebar", labelKey: "pending.entry.sidebarTeamMap" },
  { id: "sidebarPhone", area: "sidebar", labelKey: "pending.entry.sidebarPhone" },

  { id: "menuInbox", area: "menu", labelKey: "pending.entry.menuInbox" },
  { id: "menuTeam", area: "menu", labelKey: "pending.entry.menuTeam" },
  { id: "menuPublishedApps", area: "menu", labelKey: "pending.entry.menuPublishedApps" },

  { id: "chatShare", area: "chatMenu", labelKey: "pending.entry.chatShare" },
  { id: "chatInspector", area: "chatMenu", labelKey: "pending.entry.chatInspector" },

  { id: "composerGoal", area: "composer", labelKey: "pending.entry.composerGoal" },
  { id: "composerTeach", area: "composer", labelKey: "pending.entry.composerTeach" },

  { id: "composerCall", area: "call", labelKey: "pending.entry.composerCall" },
  { id: "groupCall", area: "group", labelKey: "pending.entry.groupCall" },

  { id: "panelCloud", area: "botPanel", labelKey: "pending.entry.panelCloud" },
  { id: "panelVm", area: "botPanel", labelKey: "pending.entry.panelVm" },
  { id: "panelVps", area: "botPanel", labelKey: "pending.entry.panelVps" },
  { id: "panelSimular", area: "botPanel", labelKey: "pending.entry.panelSimular" },
  { id: "panelShared", area: "botPanel", labelKey: "pending.entry.panelShared" },
  { id: "panelAndroid", area: "botPanel", labelKey: "pending.entry.panelAndroid" },
  { id: "panelPhoneScreen", area: "botPanel", labelKey: "pending.entry.panelPhoneScreen" },
  { id: "panelWebhooks", area: "botPanel", labelKey: "pending.entry.panelWebhooks" },
  { id: "panelTeamChief", area: "botPanel", labelKey: "pending.entry.panelTeamChief" },
  { id: "panelVisibility", area: "botPanel", labelKey: "pending.entry.panelVisibility" },

  { id: "automationsWebhooks", area: "automations", labelKey: "pending.entry.automationsWebhooks" },
  { id: "automationsAppTriggers", area: "automations", labelKey: "pending.entry.automationsAppTriggers" },
  { id: "automationsLimitResets", area: "automations", labelKey: "pending.entry.automationsLimitResets" },
  { id: "automationsDigests", area: "automations", labelKey: "pending.entry.automationsDigests" },

  { id: "chatAnnouncements", area: "chatCards", labelKey: "pending.entry.chatAnnouncements" },
  { id: "chatSetupOffer", area: "chatCards", labelKey: "pending.entry.chatSetupOffer" },
  { id: "chatBrief", area: "chatCards", labelKey: "pending.entry.chatBrief" },
  { id: "chatPublishedPage", area: "chatCards", labelKey: "pending.entry.chatPublishedPage" },

  { id: "appsEmail", area: "appsPanel", labelKey: "pending.entry.appsEmail" },
  { id: "appsX", area: "appsPanel", labelKey: "pending.entry.appsX" },
  { id: "appsPostiz", area: "appsPanel", labelKey: "pending.entry.appsPostiz" },
  { id: "appsHostedMcp", area: "appsPanel", labelKey: "pending.entry.appsHostedMcp" },
  { id: "appsTeamLibrary", area: "appsPanel", labelKey: "pending.entry.appsTeamLibrary" },
];

/** The prefix a moved settings row wears: "原菜单 · 原分组 · ". Empty outside the pending page. */
export const PendingSource = createContext<string | null>(null);

export const PENDING_HIDE_KEY = "omb.pendingHide";

/** `{ id: false }` means that entry is hidden; a missing id keeps its default (shown). */
export type PendingHideState = Partial<Record<PendingHideId, boolean>>;

const listeners = new Set<() => void>();
let snapshot: PendingHideState | null = null;

function storage(): Storage | undefined {
  try {
    return globalThis.window?.localStorage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function read(): PendingHideState {
  try {
    const raw = storage()?.getItem(PENDING_HIDE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const next: PendingHideState = {};
    for (const entry of PENDING_ENTRIES) {
      const value = (parsed as Record<string, unknown>)[entry.id];
      if (value === false) next[entry.id] = false;
    }
    return next;
  } catch {
    return {};
  }
}

function current(): PendingHideState {
  if (!snapshot) snapshot = read();
  return snapshot;
}

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== PENDING_HIDE_KEY) return;
    snapshot = read();
    emit();
  };
  globalThis.window?.addEventListener?.("storage", onStorage);
  return () => {
    listeners.delete(listener);
    globalThis.window?.removeEventListener?.("storage", onStorage);
  };
}

export function pendingHideOn(id: PendingHideId, state: PendingHideState = current()): boolean {
  return state[id] !== false;
}

/** Write one switch. Only `false` is stored, so a cleared storage is every default. */
export function setPendingHideOn(id: PendingHideId, on: boolean): void {
  const next: PendingHideState = { ...current() };
  if (on) delete next[id];
  else next[id] = false;
  snapshot = next;
  try {
    if (Object.keys(next).length === 0) storage()?.removeItem(PENDING_HIDE_KEY);
    else storage()?.setItem(PENDING_HIDE_KEY, JSON.stringify(next));
  } catch {
    // storage may be blocked; the switch still holds for this render.
  }
  emit();
}

/** One entry's switch, live across every window on this device. */
export function usePendingHideOn(id: PendingHideId): boolean {
  const state = useSyncExternalStore(subscribe, current, current);
  return pendingHideOn(id, state);
}

/** The page's top line: how many switches there are, and how many are off. */
export function usePendingHideCounts(): { total: number; off: number } {
  const state = useSyncExternalStore(subscribe, current, current);
  return {
    total: PENDING_ENTRIES.length,
    off: PENDING_ENTRIES.filter((entry) => !pendingHideOn(entry.id, state)).length,
  };
}
