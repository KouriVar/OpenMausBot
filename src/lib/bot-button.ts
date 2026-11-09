import type { CSSProperties } from "react";
import { mixSrgb } from "./color-contrast";
import type { MausColor } from "./mascot";
import { userBubbleTone, userBubbleToneHex } from "./user-bubble-tone";

/** Hover and press step the fill away from its ink, so the label only gains contrast. */
const HOVER_MIX = 0.12;
const PRESSED_MIX = 0.22;

export const BOT_BUTTON = "bot-button";

export type BotButtonTone = { fill: string; ink: string; hover: string; pressed: string };

function toneOf(background: string, ink: string): BotButtonTone {
  const away = ink === "#ffffff" ? "#000000" : "#ffffff";
  return {
    fill: background,
    ink,
    hover: mixSrgb(away, background, HOVER_MIX),
    pressed: mixSrgb(away, background, PRESSED_MIX),
  };
}

/** A bot's own primary button: the flat fill and ink of its Simple bubble. */
export function botButtonTone(color: MausColor): BotButtonTone {
  const { background, ink } = userBubbleTone(color);
  return toneOf(background, ink);
}

/** The same button on a colour the fork's Bloub avatar paints, so a bot's button and its bubble agree. */
export function botButtonToneHex(hex: string): BotButtonTone {
  const { background, ink } = userBubbleToneHex(hex);
  return toneOf(background, ink);
}

function styleOf(tone: BotButtonTone): CSSProperties {
  return {
    "--bot-button": tone.fill,
    "--bot-button-ink": tone.ink,
    "--bot-button-hover": tone.hover,
    "--bot-button-pressed": tone.pressed,
  } as CSSProperties;
}

export function botButtonStyle(color: MausColor): CSSProperties {
  return styleOf(botButtonTone(color));
}

export function botButtonStyleHex(hex: string): CSSProperties {
  return styleOf(botButtonToneHex(hex));
}

export type BotButton = { className: string; style?: CSSProperties };

/** A primary action that belongs to one bot. `shape` sizes it either way; `plain` is its look when no single bot owns
 * it, as in a room or for a teammate's line. */
export function botButton(color: MausColor | undefined, shape: string, plain: string): BotButton {
  const classes = (look: string) => [shape, look].filter(Boolean).join(" ");
  return color ? { className: classes(BOT_BUTTON), style: botButtonStyle(color) } : { className: classes(plain) };
}
