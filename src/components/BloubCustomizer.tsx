import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useBloubSkin, saveBloubSkin, type BloubSkin } from "@/fork/bloub-skin";
import { EXPRESSION_LABELS, COLOR_LABELS, SHAPE_LABELS } from "@/fork/bloub-names";
import type { MausColor } from "@/lib/mascot";
import { COLORS, SHAPES } from "@/vendor/bloub/skins";
import { EXPRESSIONS } from "@/vendor/bloub/expressions";
import { BloubAvatar } from "./BloubAvatar";

const PREVIEW_AT = 1;

/** One frozen Bloub in a clickable cell, its name under it: Bloub's own BotTile. */
function BloubTile({ label, selected, shape, colorId, expression, size = 46, onClick }: {
  label: string;
  selected: boolean;
  shape: string;
  colorId: string;
  expression: string;
  size?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center rounded-xl border-2 p-1 transition-colors",
        selected ? "border-ink" : "border-transparent hover:border-hairline",
      )}
    >
      <BloubAvatar size={size} shape={shape} colorId={colorId} expression={expression} frozenAt={PREVIEW_AT} animated={false} />
      <span className="mt-0.5 text-center text-[11px] leading-tight text-ink-secondary">{label}</span>
    </button>
  );
}

/** The fork's avatar editor: Bloub's shapes, expressions and colours, in place of the mascot's. */
export function BloubCustomizer({ botId, color }: { botId: string | undefined; color: MausColor }) {
  const skin = useBloubSkin(botId, color);
  const update = (patch: Partial<BloubSkin>) => {
    if (!botId) return;
    saveBloubSkin(botId, { ...skin, ...patch });
  };
  const heading = "mb-2 mt-4 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-secondary";
  return (
    <div>
      <div className={heading}>{t("bloubCustomizer.shape")}</div>
      <div className="grid grid-cols-4 gap-1.5">
        {SHAPES.map((shape) => (
          <BloubTile key={shape.id} label={SHAPE_LABELS[shape.id] ?? shape.id} selected={skin.shape === shape.id}
            shape={shape.id} colorId={skin.color} expression={skin.expression} onClick={() => update({ shape: shape.id })} />
        ))}
      </div>

      <div className={heading}>{t("bloubCustomizer.expression")}</div>
      <div className="grid grid-cols-4 gap-1.5">
        {EXPRESSIONS.map((expression) => (
          <BloubTile key={expression.id} label={EXPRESSION_LABELS[expression.id] ?? expression.id} selected={skin.expression === expression.id}
            shape={skin.shape} colorId={skin.color} expression={expression.id} onClick={() => update({ expression: expression.id })} />
        ))}
      </div>

      <div className={heading}>{t("bloubCustomizer.color")}</div>
      <div className="grid grid-cols-6 gap-1.5">
        {COLORS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-label={COLOR_LABELS[entry.id] ?? entry.id}
            aria-pressed={skin.color === entry.id}
            onClick={() => update({ color: entry.id })}
            className={cn(
              "flex aspect-square items-center justify-center rounded-full border-2 transition-colors",
              skin.color === entry.id ? "border-ink" : "border-transparent hover:border-hairline",
            )}
          >
            {/* An inner ring so the cream dot stays visible on a light panel. */}
            <span className="block h-[78%] w-[78%] rounded-full ring-1 ring-inset ring-black/10" style={{ background: entry.hex }} />
          </button>
        ))}
      </div>
    </div>
  );
}
