import { useSyncExternalStore } from "react";

/** Which avatar this fork draws: the MausBot mascot, or the Bloub (Grok-style) one. */
export type ForkAvatarStyle = "maus" | "bloub";

export const FORK_AVATAR_STYLE_KEY = "omb.fork.avatarStyle";

let sessionChoice: ForkAvatarStyle | undefined;
const listeners = new Set<() => void>();

function load(): ForkAvatarStyle {
  try {
    return globalThis.localStorage?.getItem(FORK_AVATAR_STYLE_KEY) === "bloub" ? "bloub" : "maus";
  } catch {
    return "maus";
  }
}

function current(): ForkAvatarStyle {
  return sessionChoice ?? load();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setForkAvatarStyle(style: ForkAvatarStyle): void {
  sessionChoice = style;
  try {
    globalThis.localStorage?.setItem(FORK_AVATAR_STYLE_KEY, style);
  } catch {
  }
  for (const listener of listeners) listener();
}

export function useForkAvatarStyle(): ForkAvatarStyle {
  return useSyncExternalStore(subscribe, current, () => "maus");
}
