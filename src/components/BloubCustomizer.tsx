import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useBloubSkin, saveBloubSkin, bloubColorChoices, FORK_HIDE_EXPRESSIONS_IN_PANEL, type BloubSkin } from "@/fork/bloub-skin";
import { bloubShapeChoices } from "@/fork/bloub-shapes";
import { EXPRESSION_LABELS, COLOR_LABELS, SHAPE_LABELS } from "@/fork/bloub-names";
import type { MausColor } from "@/lib/mascot";
import { EXPRESSIONS } from "@/vendor/bloub/expressions";
import { BloubAvatar } from "./BloubAvatar";

const PREVIEW_AT = 1;
const SELECT_RING = "#9a9a9a";

/** One frozen Bloub in a clickable cell; the selected one gets a thin ring that follows the shape. */
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
    <button type="button" aria-label={label} aria-pressed={selected} onClick={onClick}
      className="flex flex-col items-center rounded-xl p-1 transition-colors hover:bg-ink/[0.04]">
      <BloubAvatar size={size} shape={shape} colorId={colorId} expression={expression} frozenAt={PREVIEW_AT} animated={false}
        outlineColor={selected ? SELECT_RING : undefined} />
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
  const shapes = bloubShapeChoices();
  const row = (slice: ReadonlyArray<{ id: string }>, cols: string) => (
    <div className={cn("gap-1.5", cols)}>
      {slice.map((shape) => (
        <BloubTile key={shape.id} label={SHAPE_LABELS[shape.id] ?? shape.id} selected={skin.shape === shape.id}
          shape={shape.id} colorId={skin.color} expression={skin.expression} onClick={() => update({ shape: shape.id as never })} />
      ))}
    </div>
  );
  return (
    <div>
      <div className={heading}>{t("bloubCustomizer.shape")}</div>
      {/* Grok's panel: 13 shapes in 5 + 5 + 3, each row centred. */}
      <div className="flex flex-col items-center">
        {row(shapes.slice(0, 5), "grid grid-cols-5")}
        <div className="mt-1.5 flex w-full justify-center">{row(shapes.slice(5, 10), "grid grid-cols-5")}</div>
        <div className="mt-1.5 flex w-full justify-center">{row(shapes.slice(10), "flex")}</div>
      </div>

      {!FORK_HIDE_EXPRESSIONS_IN_PANEL && (
        <>
          <div className={heading}>{t("bloubCustomizer.expression")}</div>
          <div className="grid grid-cols-4 gap-1.5">
            {EXPRESSIONS.map((expression) => (
              <BloubTile key={expression.id} label={EXPRESSION_LABELS[expression.id] ?? expression.id} selected={skin.expression === expression.id}
                shape={skin.shape} colorId={skin.color} expression={expression.id} onClick={() => update({ expression: expression.id })} />
            ))}
          </div>
        </>
      )}

      <div className={heading}>{t("bloubCustomizer.color")}</div>
      {(() => {
        const choices = bloubColorChoices();
        const swatch = (entry: { id: string; hex: string }) => (
          <button key={entry.id} type="button" aria-label={COLOR_LABELS[entry.id] ?? entry.id} aria-pressed={skin.color === entry.id}
            onClick={() => update({ color: entry.id as never })}
            className={cn("flex size-7 shrink-0 items-center justify-center rounded-full transition-shadow",
              skin.color === entry.id ? "ring-1 ring-ink-tertiary ring-offset-2 ring-offset-panel" : "hover:ring-1 hover:ring-hairline")}>
            <span className="block h-[78%] w-[78%] rounded-full ring-1 ring-inset ring-black/10" style={{ background: entry.hex }} />
          </button>
        );
        return (<>
          <div className="grid grid-cols-6 gap-1.5">{choices.slice(0, 6).map(swatch)}</div>
          <div className="mt-1.5 flex justify-center gap-1.5">{choices.slice(6).map(swatch)}</div>
        </>);
      })()}
    </div>
  );
}
