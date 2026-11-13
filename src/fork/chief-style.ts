// Fork: which mark a bot's Chief shows (a crown, or a department lead's flag). Chief itself lives on the bot and on the
// server; this is display only, so it is kept where the other fork preferences are, in this computer's storage, one
// choice per bot. No server change, and no data folder moves.
import { useCallback, useEffect, useState } from "react";

import { DEFAULT_CHIEF_STYLE, isChiefStyle, type ChiefStyle } from "./chief-mark";

export const CHIEF_STYLE_KEY = "omb.fork.chiefStyle";
export const CHIEF_STYLE_EVENT = "omb:chief-style";

type Choices = Record<string, ChiefStyle>;

function readAll(): Choices {
  try {
    const raw = localStorage.getItem(CHIEF_STYLE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return {};
    const choices: Choices = {};
    for (const [botId, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isChiefStyle(value)) choices[botId] = value;
    }
    return choices;
  } catch {
    return {};
  }
}

function writeAll(choices: Choices): void {
  try {
    localStorage.setItem(CHIEF_STYLE_KEY, JSON.stringify(choices));
  } catch {
  }
  try {
    window.dispatchEvent(new CustomEvent(CHIEF_STYLE_EVENT));
  } catch {
  }
}

/** The bot's mark; a bot with no choice shows the crown. */
export function chiefStyleOf(botId: string | undefined): ChiefStyle {
  return (botId && readAll()[botId]) || DEFAULT_CHIEF_STYLE;
}

/** Chooses the mark for one bot. The other mark is not kept anywhere, so a bot is only ever one of them. */
export function setChiefStyle(botId: string, style: ChiefStyle): void {
  const choices = readAll();
  if (style === DEFAULT_CHIEF_STYLE) delete choices[botId];
  else choices[botId] = style;
  writeAll(choices);
}

export function useChiefStyle(botId: string | undefined): ChiefStyle {
  const [style, setStyle] = useState<ChiefStyle>(() => chiefStyleOf(botId));
  const refresh = useCallback(() => setStyle(chiefStyleOf(botId)), [botId]);
  useEffect(() => {
    refresh();
    window.addEventListener(CHIEF_STYLE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHIEF_STYLE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return style;
}
