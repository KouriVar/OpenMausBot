import { t } from "@/lib/i18n";
import { UNREAD_DIVIDER_FADE_MS } from "@/lib/unread-divider";
import { cn } from "@/lib/cn";

/** The bot's Bloub accent, when the fork draws that avatar: the label and both gradients take its colour,
 * solid next to the words and fading to nothing at the ends. `undefined` keeps the theme's accent. */
export function NewMessagesDivider({ fading, accent }: { fading: boolean; accent?: string }) {
  const tint = accent ? `${accent}99` : undefined;
  return (
    <div
      role="separator"
      aria-label={t("chat.newMessagesAria")}
      data-unread-divider
      className={cn(
        "grid ease-out transition-[grid-template-rows,opacity,margin-bottom] motion-reduce:transition-none",
        fading ? "-mb-3 grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
      )}
      style={{ transitionDuration: `${UNREAD_DIVIDER_FADE_MS}ms` }}
    >
      <div className="min-h-0 overflow-hidden">
        <div aria-hidden="true" className="animate-msg-in flex items-center gap-3 py-0.5">
          <span
            className="h-px flex-1 bg-linear-to-r from-transparent to-accent/60 rtl:bg-linear-to-l"
            style={tint ? { background: `linear-gradient(to right, transparent, ${tint})` } : undefined}
          />
          <span
            className="text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] text-accent-text"
            style={accent ? { color: accent } : undefined}
          >
            {t("chat.newMessages")}
          </span>
          <span
            className="h-px flex-1 bg-linear-to-l from-transparent to-accent/60 rtl:bg-linear-to-r"
            style={tint ? { background: `linear-gradient(to left, transparent, ${tint})` } : undefined}
          />

        </div>
      </div>
    </div>
  );
}
