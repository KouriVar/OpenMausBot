import { useColorScheme, type ColorScheme } from "@/lib/color-scheme";
import type { MausColor } from "@/lib/mascot";
import { mixHex } from "@/vendor/bloub/skins";
import { bloubGradient, bloubSolid, normalizeBloubColor, useBloubSkin } from "@/fork/bloub-skin";
import { BloubAvatar } from "./BloubAvatar";

/* ------------------------------------------------ readable colour on a theme */

function srgb(hex: string): [number, number, number] {
  const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex.slice(0, 7);
  const v = Number.parseInt(full.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = srgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return r! * 0.2126 + g! * 0.7152 + b! * 0.0722;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** The background a name/mention sits on, per theme (the app's dark ≈ #0f0f10, light ≈ #ffffff). */
const THEME_BG: Record<ColorScheme, string> = { dark: "#0f0f10", light: "#ffffff" };

/**
 * A Bloub colour made readable as text on the current theme: start from the pure solid, then the
 * gradient's ends, then lighten/darken toward white/black until it clears 4.5:1. `black` reads white on
 * dark and black on light. Names and @ chips both use this so they always match their avatar's colour.
 */
export function bloubReadableColor(id: string, scheme: ColorScheme, min = 4.5): string {
  const bg = THEME_BG[scheme];
  const g = bloubGradient(id, scheme);
  const candidates = [bloubSolid(normalizeBloubColor(id), scheme), g.from, g.to];
  for (const c of candidates) if (contrastRatio(c, bg) >= min) return c;
  let best = candidates.reduce((b, c) => (contrastRatio(c, bg) > contrastRatio(b, bg) ? c : b), candidates[0]!);
  const toward = scheme === "dark" ? "#ffffff" : "#000000";
  for (let t = 0.15; t <= 1; t += 0.15) {
    const mix = mixHex(best, toward, t);
    if (contrastRatio(mix, bg) >= min) return mix;
    best = mix;
  }
  return best;
}

/* ------------------------------------------------ a bot's current identity */

export interface BloubIdentity { shape: string; colorId: string; color: string }

/** A bot's live Bloub identity: shape + colour id from its store, and the readable name colour. Re-reads
 * whenever any Bloub skin is saved (same data source the avatar uses), so it updates without a refresh. */
export function useBloubIdentity(botId: string | undefined, fallbackColor: MausColor | string | undefined): BloubIdentity {
  const skin = useBloubSkin(botId, fallbackColor);
  const scheme = useColorScheme();
  return { shape: skin.shape, colorId: skin.color, color: bloubReadableColor(skin.color, scheme) };
}

/** The little face that sits before a sender's name — same shape and colour as the name. */
function IdentityFace({ shape, colorId }: { shape: string; colorId: string }) {
  return (
    <span className="inline-flex shrink-0" aria-hidden="true" style={{ width: 18, height: 18 }}>
      <BloubAvatar size={18} frameSize={18} fitBody shape={shape} colorId={colorId} frozenAt={1} animated={false} />
    </span>
  );
}

/** A group message's sender label: a small face plus the name, both in the bot's Bloub colour. */
export function SpeakerName({ label, botId, fallbackColor }: { label: string; botId?: string; fallbackColor?: MausColor | string }) {
  const iden = useBloubIdentity(botId, fallbackColor); // hook must run unconditionally
  if (!botId) return <span className="text-[12px] font-medium text-ink-secondary">{label}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: iden.color }}>
      <IdentityFace shape={iden.shape} colorId={iden.colorId} />
      {label}
    </span>
  );
}

/** One unified @ mention chip: a 15px static face + the name in the bot's colour, on a ~14% tint.
 * `bare` drops the face and padding so the textarea mirror keeps identical caret metrics. */
export function MentionChip({ name, botId, fallbackColor, you, person, bare }: {
  name: string; botId?: string; fallbackColor?: MausColor | string; you?: boolean; person?: boolean; bare?: boolean;
}) {
  const scheme = useColorScheme();
  const skin = useBloubSkin(botId, fallbackColor);
  const color = botId
    ? bloubReadableColor(skin.color, scheme)
    : you ? "var(--color-accent)" : "var(--color-ink-secondary)";
  if (bare) {
    return <span className="mention-chip mention-chip-bare" style={{ ["--mention-color" as string]: color }}>{name}</span>;
  }
  return (
    <span className="mention-chip" style={{ ["--mention-color" as string]: color }}>
      {botId && (
        <span className="mention-chip-face" aria-hidden="true">
          <BloubAvatar size={15} frameSize={15} fitBody shape={skin.shape} colorId={skin.color} frozenAt={1} animated={false} />
        </span>
      )}
      <span className="mention-chip-name">{name}</span>
      {person ? <span className="sr-only"> </span> : null}
    </span>
  );
}
