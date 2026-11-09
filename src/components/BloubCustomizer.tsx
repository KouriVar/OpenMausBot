import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useColorScheme } from "@/lib/color-scheme";
import { useBloubSkin, saveBloubSkin, bloubColorChoices, bloubSwatch, FORK_HIDE_EXPRESSIONS_IN_PANEL, type BloubSkin } from "@/fork/bloub-skin";
import { bloubShapeChoices } from "@/fork/bloub-shapes";
import { EXPRESSION_LABELS, COLOR_LABELS, SHAPE_LABELS } from "@/fork/bloub-names";
import type { MausColor } from "@/lib/mascot";
import { EXPRESSIONS } from "@/vendor/bloub/expressions";
import { BloubAvatar } from "./BloubAvatar";

const PREVIEW_AT = 1;
const SELECT_RING = "#9a9a9a";

/** One frozen Bloub in a 48×48 cell (36px face), like Grok's picker: instant hover overlay, the
 * selected cell's border always shown, and no animation. */
function BloubTile({ label, selected, shape, colorId, expression, theme, onClick }: {
  label: string;
  selected: boolean;
  shape: string;
  colorId: string;
  expression: string;
  theme: "light" | "dark";
  onClick: () => void;
}) {
  return (
    <button type="button" aria-label={label} aria-pressed={selected} onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-lg",
        selected ? "bg-ink/[0.10] ring-1 ring-ink-tertiary" : "hover:bg-ink/[0.06]",
      )}
      style={{ width: 48, height: 48, padding: 0 }}>
      <BloubAvatar size={36} shape={shape} colorId={colorId} expression={expression} frozenAt={PREVIEW_AT} animated={false}
        theme={theme} outlineColor={selected ? SELECT_RING : undefined} />
    </button>
  );
}

/** The fork's avatar editor: Grok's 13 shapes (5+5+3) and 11 gradient colours. */
export function BloubCustomizer({ botId, color }: { botId: string | undefined; color: MausColor }) {
  const skin = useBloubSkin(botId, color);
  const scheme = useColorScheme();
  const update = (patch: Partial<BloubSkin>) => {
    if (!botId) return;
    saveBloubSkin(botId, { ...skin, ...patch });
  };
  const heading = "mb-2 mt-4 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-secondary";
  const shapes = bloubShapeChoices();
  const tile = (shape: { id: string }) => (
    <BloubTile key={shape.id} label={SHAPE_LABELS[shape.id] ?? shape.id} selected={skin.shape === shape.id}
      shape={shape.id} colorId={skin.color} expression={skin.expression} theme={scheme}
      onClick={() => update({ shape: shape.id })} />
  );
  return (
    <div>
      <div className={heading}>{t("bloubCustomizer.shape")}</div>
      {(() => {
        const rows = [shapes.slice(0, 5), shapes.slice(5, 10), shapes.slice(10)];
        return (
          <div className="flex flex-col items-center" style={{ gap: 3 }}>
            {rows.map((row, index) => (
              <div key={index} className="flex justify-center" style={{ gap: 3 }}>
                {row.map(tile)}
              </div>
            ))}
          </div>
        );
      })()}

      {!FORK_HIDE_EXPRESSIONS_IN_PANEL && (
        <>
          <div className={heading}>{t("bloubCustomizer.expression")}</div>
          <div className="grid grid-cols-4 gap-1.5">
            {EXPRESSIONS.map((expr) => (
              <BloubTile key={expr.id} label={EXPRESSION_LABELS[expr.id] ?? expr.id} selected={skin.expression === expr.id}
                shape={skin.shape} colorId={skin.color} expression={expr.id} theme={scheme}
                onClick={() => update({ expression: expr.id })} />
            ))}
          </div>
        </>
      )}

      <div className={heading}>{t("bloubCustomizer.color")}</div>
      {(() => {
        const choices = bloubColorChoices();
        const swatch = (entry: { id: string; hex: string }) => (
          <button key={entry.id} type="button" aria-label={COLOR_LABELS[entry.id] ?? entry.id} aria-pressed={skin.color === entry.id}
            onClick={() => update({ color: entry.id })}
            className={cn("flex size-7 shrink-0 items-center justify-center rounded-full",
              skin.color === entry.id ? "ring-1 ring-ink-tertiary ring-offset-2 ring-offset-panel" : "hover:ring-1 hover:ring-hairline")}>
            <span className="block h-[78%] w-[78%] rounded-full ring-1 ring-inset ring-black/10"
              style={{ background: bloubSwatch(entry.id, scheme) }} />
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
