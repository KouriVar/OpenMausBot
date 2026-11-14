import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import {
  blankFilled, blankStart, paragraphStart, scanBlanks, type BlankDef,
} from "../../../packages/phone-protocol/src/blanks";
import { skinAnswerText } from "../../../packages/phone-protocol/src/skins";
import { WidgetMenu } from "./WidgetMenu";
import { OptionSkin } from "./OptionSkin";
import { newWidgetSendId, sendWidgetFill } from "./widget-send";
import { MENU_ITEM } from "../menu-recipe";

export interface BlankMessageInfo {
  botId: string;
  threadId?: string;
  messageId: string;
  values: Record<string, string>;
}

export interface PreparedBlankText {
  source: string;
  defs: Record<string, BlankDef>;
  pending: boolean;
  waiting: boolean;
}

const PENDING = "[](#omb-blank-pending)";
const BLANK = "[](#omb-blank:";

/** Turn `<blank>…</blank>` into Markdown links the chat's own renderer swaps for
 * controls. Text after an unfilled `wait` blank stays out until it is filled. */
export function prepareBlankMarkdown(text: string, values: Record<string, string>): PreparedBlankText {
  const scanned = scanBlanks(text);
  const parts: string[] = [];
  let waiting = false;
  for (const piece of scanned.pieces) {
    if (piece.type === "text") {
      parts.push(piece.text);
      continue;
    }
    const def = scanned.defs[piece.key];
    if (!def) continue;
    parts.push(`${BLANK}${encodeURIComponent(piece.key)})`);
    if (def.wait && !blankFilled(values, piece.key)) {
      waiting = true;
      break;
    }
  }
  return { source: parts.join("") + (waiting ? PENDING : scanned.pending ? PENDING : ""), defs: scanned.defs, pending: scanned.pending, waiting };
}

interface BlankState {
  values: Record<string, string>;
  defs: Record<string, BlankDef>;
  pending: boolean;
  rewriting: boolean;
  rewriteAt?: number;
  notice?: string;
  choose: (key: string, value: string, delay: number) => void;
}

const BLANK_STATE = createContext<BlankState | null>(null);
const useBlankState = (): BlankState | null => useContext(BLANK_STATE);

/** The values, the hidden fill requests and the one rewrite a message may be in. */
export function useBlankMessage(info: BlankMessageInfo | undefined, text: string): BlankState {
  const [values, setValues] = useState<Record<string, string>>(info?.values ?? {});
  const [pending, setPending] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewriteKey, setRewriteKey] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const timer = useRef<number>(undefined);
  const timeout = useRef<number>(undefined);
  const base = useRef(text);
  const live = useRef(info);
  live.current = info;
  const defs = useMemo(() => scanBlanks(text).defs, [text]);

  useEffect(() => {
    setValues((current) => {
      const next = { ...info?.values };
      return JSON.stringify(current) === JSON.stringify(next) ? current : next;
    });
  }, [info?.values]);

  useEffect(() => {
    if (!pending && !rewriting) return;
    if (text === base.current) return;
    setPending(false);
    setRewriting(false);
    setNotice(undefined);
    window.clearTimeout(timer.current);
    window.clearTimeout(timeout.current);
  }, [pending, rewriting, text]);

  useEffect(() => () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(timeout.current);
  }, []);

  const choose = useCallback((key: string, value: string, delay: number) => {
    const current = live.current;
    if (!current) return;
    const before = values[key] ?? "";
    const willFinish = Object.keys(defs).every((name) => (name === key ? value : values[name] ?? "").trim());
    setValues((next) => ({ ...next, [key]: value }));
    window.clearTimeout(timer.current);
    if (before.trim() === value.trim()) {
      setPending(false);
      return;
    }
    setNotice(undefined);
    timer.current = window.setTimeout(() => {
      if (!live.current) return;
      base.current = text;
      setPending(willFinish);
      const sendId = newWidgetSendId();
      void sendWidgetFill({ botId: current.botId, threadId: current.threadId, messageId: current.messageId, rev: 0, values: { ...values, [key]: value }, sendId })
        .then((result) => {
          if (!result.ok) {
            setValues((next) => ({ ...next, [key]: before }));
            setPending(false);
            setNotice(result.error ?? t("blank.fillFailed"));
            return;
          }
          if (before.trim() && willFinish) {
            setRewriteKey(key);
            setRewriting(true);
          }
          window.clearTimeout(timeout.current);
          timeout.current = window.setTimeout(() => {
            setPending(false);
            setRewriting(false);
            setNotice(t("blank.stillWaiting"));
          }, 90_000);
        });
    }, Math.max(0, delay));
  }, [defs, text, values]);

  const rewriteAt = rewriting && rewriteKey ? (() => {
    const at = blankStart(text, rewriteKey);
    return at < 0 ? undefined : paragraphStart(text, at);
  })() : undefined;
  return { values, defs, pending, rewriting, rewriteAt, notice, choose };
}

export function BlankProvider({ state, children }: { state: BlankState | null; children: ReactNode }) {
  return <BLANK_STATE.Provider value={state}>{children}</BLANK_STATE.Provider>;
}

/** The link renderer's half: a filled value in solid accent, an unfilled ask on a dashed line. */
export function BlankSlotLink({ href }: { href: string }) {
  const state = useBlankState();
  if (href === "#omb-blank-pending") return <span aria-hidden="true" className="inline-block h-[1.05em] w-12 animate-pulse rounded-[4px] bg-ink/10 align-[-0.18em]" />;
  if (!href.startsWith("#omb-blank:") || !state) return null;
  let key = "";
  try {
    key = decodeURIComponent(href.slice("#omb-blank:".length));
  } catch {
    return null;
  }
  const def = state.defs[key];
  return def ? <BlankSlot def={def} state={state} /> : null;
}

function delayFor(def: BlankDef): number {
  if (def.skin.multi) return 900;
  if (def.skin.ui === "dates") return 900;
  if (def.skin.ui === "slider" || def.skin.ui === "range" || def.skin.ui === "pad" || def.skin.ui === "map" || def.skin.ui === "time") return 450;
  return 0;
}

function BlankSlot({ def, state }: { def: BlankDef; state: BlankState }) {
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(state.values[def.key] ?? "");
  useEffect(() => {
    if (!open) setDraft(state.values[def.key] ?? "");
  }, [open, state.values, def.key]);
  const value = state.values[def.key] ?? "";
  const answer = skinAnswerText(def.skin, value);
  const filled = Boolean(value.trim());
  const choose = (next: string) => {
    const offered = def.skin.options.some((option) => (option.value ?? option.label) === next);
    setDraft(next);
    state.choose(def.key, next, offered ? delayFor(def) : 900);
    const continuous = def.skin.ui === "slider" || def.skin.ui === "range" || def.skin.ui === "pad" || def.skin.ui === "map";
    const customText = !offered && def.skin.ui !== "dates" && def.skin.ui !== "time";
    if ((!def.skin.multi && !continuous && !customText) || (def.skin.ui === "dates" && next.includes(","))) setOpen(false);
  };
  return (
    <>
      <button ref={button} type="button" aria-haspopup="dialog" aria-expanded={open}
        aria-label={filled ? `${def.ask}: ${answer ?? value}` : def.ask}
        title={filled ? t("blank.edit") : def.ask}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "mx-0.5 inline-flex max-w-full items-baseline gap-1 rounded-[5px] px-1 align-baseline text-[0.98em] leading-[1.35] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          filled ? "border-b border-accent text-ink hover:bg-accent/[0.08]" : "border-b border-dashed border-ink-tertiary text-ink-secondary hover:bg-ink/[0.06] hover:text-ink",
          state.pending && state.values[def.key] === value && "opacity-70",
        )}>
        <bdi dir="auto" className="min-w-0 whitespace-normal [overflow-wrap:anywhere]">{filled ? answer ?? value : def.ask}</bdi>
        {filled ? <Check aria-hidden="true" size={11} className="shrink-0 text-accent" /> : <span aria-hidden="true" className="shrink-0 text-[10px] text-ink-tertiary">{def.placeholder ?? ""}</span>}
      </button>
      <WidgetMenu anchor={button.current} open={open} onClose={() => setOpen(false)}
        minWidth={def.skin.ui === "pad" || def.skin.ui === "map" || def.skin.ui === "grid" || def.skin.ui === "layouts" ? 320 : 280}
        role="dialog" label={def.ask}>
        <div className="flex items-start gap-2 px-1.5 pb-1 pt-0.5">
          <span dir="auto" className="min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-ink">{def.ask}</span>
          {state.pending && <LoaderCircle aria-hidden="true" size={13} className="mt-0.5 shrink-0 animate-spin text-ink-tertiary" />}
        </div>
        <div className="px-1 pb-1">
          <OptionSkin spec={def.skin} value={draft || value} onChange={choose} ariaLabel={def.ask} />
        </div>
        {def.kind !== "only_you" && <p className={cn(MENU_ITEM, "min-h-7 text-[12px] text-ink-tertiary")}>{def.kind === "unsure" ? t("blank.unsure") : t("blank.yours")}</p>}
      </WidgetMenu>
    </>
  );
}

/** A quiet line under a message while its answer is being written on. */
export function BlankStatus({ state }: { state: BlankState }) {
  if (!state.notice && !state.pending) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] leading-4 text-ink-tertiary" role="status">
      {state.pending && <LoaderCircle aria-hidden="true" size={12} className="animate-spin" />}
      <span dir="auto">{state.notice ?? (state.rewriting ? t("blank.rewriting") : t("blank.continuing"))}</span>
    </p>
  );
}
