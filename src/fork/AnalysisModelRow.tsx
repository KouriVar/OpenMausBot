import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { api, useStore, type Bot, type ConfigStatus } from "@/state/store";
import { configuredModelInstances } from "@/lib/engine-rail";
import { modelName, simpleModelMenu } from "@/lib/simple-model-menu";
import { MENU_SHEET } from "@/components/menu-recipe";
import { useMenuMotion } from "@/components/MenuMotion";
import { InstanceProviderMark } from "@/components/ProviderIcons";
import { SettingRow } from "@/components/SettingsPrimitives";
import { SimpleModelMenu } from "@/components/SimpleModelMenu";
import { AMBIGUITY_FAST_MODEL } from "../../shared/composer-ambiguity";

const WIDTH = 360;
const EDGE = 8;

/** Settings → General → Input: the model behind the composer's ambiguity pass, and
 * a blank continuation. The first row is the fixed default this app already used. */
export function AnalysisModelRow() {
  const { state, dispatch } = useStore();
  const selection = state.config?.features?.analysisModel;
  const instance = selection && state.instances.find((candidate) => candidate.instanceId === selection.instanceId);
  const available = Boolean(instance?.models.options.some((option) => option.id === selection?.model));
  const unavailable = Boolean(selection && !available);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [place, setPlace] = useState<{ left: number; top: number; maxHeight: number }>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const motion = useMenuMotion(open);
  const id = useId();

  const listed = configuredModelInstances(state.instances, selection?.instanceId);
  const emptySelection = { instanceId: "", model: "" };
  const menu = simpleModelMenu({
    instances: state.instances,
    listed,
    selection: selection ?? emptySelection,
    bot: { name: state.bots[0]?.name ?? "", selection: selection ?? emptySelection, follows: false },
    query, expanded, probing: new Set(), loading: false,
  });

  useLayoutEffect(() => {
    if (!open) return;
    const box = trigger.current?.getBoundingClientRect();
    if (!box) return;
    const width = Math.min(WIDTH, window.innerWidth - EDGE * 2);
    const left = Math.min(Math.max(EDGE, box.right - width), Math.max(EDGE, window.innerWidth - width - EDGE));
    const below = window.innerHeight - box.bottom - EDGE;
    const above = box.top - EDGE;
    const maxHeight = Math.min(520, Math.max(180, below >= 300 || below >= above ? below : above));
    setPlace({ left, top: below >= 300 || below >= above ? box.bottom + 6 : Math.max(EDGE, box.top - maxHeight - 6), maxHeight });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (trigger.current?.contains(event.target)) return;
      if (panel.current?.contains(event.target)) return;
      setOpen(false);
    };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("pointerdown", away, true);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", away, true);
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  const save = async (next: { instanceId: string; model: string } | null) => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const config: ConfigStatus = await api("/api/config", {
        method: "PATCH",
        body: JSON.stringify({ features: { analysisModel: next } }),
      });
      dispatch({ type: "configStatus", config });
      setOpen(false);
      setQuery("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("settings.analysisModel.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const label = selection
    ? modelName(instance, selection.model)
    : t("settings.analysisModel.follow", { model: AMBIGUITY_FAST_MODEL });
  return (
    <SettingRow
      title={t("settings.analysisModel.title")}
      subtitle={t("settings.analysisModel.subtitle")}
      message={unavailable
        ? <span className="text-ink-tertiary">{t("settings.analysisModel.unavailable")}</span>
        : error ? <span role="alert" className="text-ink-tertiary">{error}</span> : undefined}
    >
      <button ref={trigger} type="button" data-analysis-model-trigger="" disabled={saving}
        aria-haspopup="dialog" aria-expanded={open} aria-label={t("settings.analysisModel.aria")}
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 max-w-[240px] min-w-0 items-center gap-1.5 rounded-lg border border-hairline/40 bg-inset px-2.5 text-[13px] leading-[18px] text-ink hover:bg-raised-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60">
        <span className="me-0.5 flex size-3.5 shrink-0 items-center justify-center">
          {instance ? <InstanceProviderMark instance={instance} size={14} subtle /> : <span className="size-2 rounded-full bg-ink/20" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1 truncate text-start">{label}</span>
        <ChevronDown size={12} aria-hidden="true" className="shrink-0 text-ink-tertiary" />
      </button>
      {motion.shown && place && createPortal(
        <div ref={panel} id={`${id}-menu`} role="dialog" aria-label={t("settings.analysisModel.title")} {...motion.exitProps}
          className={cn(MENU_SHEET, "pointer-events-auto fixed z-[80] !gap-0 min-h-0 overflow-hidden overscroll-contain p-0", motion.className)}
          style={{ left: place.left, top: place.top, width: Math.min(WIDTH, window.innerWidth - EDGE * 2), maxHeight: place.maxHeight }}>
          <button type="button" data-analysis-model-default="" aria-pressed={!selection}
            onClick={() => void save(null)}
            className="flex min-h-9 w-full shrink-0 items-center gap-2 border-b-[0.5px] border-ink/10 px-3.5 text-left text-[13px] leading-[18px] text-ink hover:bg-ink/[0.06]">
            <span className="size-3.5 shrink-0 rounded-full bg-ink/[0.08]" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{t("settings.analysisModel.follow", { model: AMBIGUITY_FAST_MODEL })}</span>
            {!selection && <Check size={14} className="shrink-0 text-ink" aria-hidden="true" />}
          </button>
          <SimpleModelMenu
            menu={{ ...menu, current: null, follow: false }}
            query={query}
            bot={state.bots[0] ?? ({} as Bot)}
            botModel={{ label: "", title: "" }}
            onQuery={setQuery}
            onPick={(picked, model) => void save({ instanceId: picked.instanceId, model })}
            onPickCurrent={() => undefined}
            onFollowBot={() => undefined}
            onToggle={(picked) => setExpanded((current) => {
              const next = new Set(current);
              if (next.has(picked.instanceId)) next.delete(picked.instanceId);
              else next.add(picked.instanceId);
              return next;
            })}
            onSetUp={() => { setOpen(false); dispatch({ type: "toggleAppSettings", open: true, section: "engines" }); }}
            onCheckAgain={() => undefined}
            idPrefix={id}
          />
        </div>,
        document.body,
      )}
    </SettingRow>
  );
}
