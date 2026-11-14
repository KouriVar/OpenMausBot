import { cn } from "@/lib/cn";
import { useCallback, useLayoutEffect, useRef, useState, type RefObject, type TextareaHTMLAttributes } from "react";
import { type MentionPeer } from "@/lib/mentions";
import { MentionText } from "./MentionText";

const TEXT_LAYOUT = ["font-family", "font-size", "font-weight", "font-style", "font-stretch", "font-feature-settings", "font-variation-settings",
  "letter-spacing", "word-spacing", "line-height", "text-indent", "tab-size", "padding-top", "padding-right", "padding-bottom", "padding-left"] as const;

export interface TextMark { start: number; end: number; }

function offsetRange(root: Node, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let offset = 0;
  let opened = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const length = node.nodeValue?.length ?? 0;
    if (!opened && start <= offset + length) {
      range.setStart(node, Math.max(0, start - offset));
      opened = true;
    }
    if (opened && end <= offset + length) {
      range.setEnd(node, Math.max(0, end - offset));
      return range;
    }
    offset += length;
  }
  return null;
}

export function MentionTextarea({ inputRef, peers, everyone = false, wrapperClassName, marks, clarified, activeMark, onMarkClick, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  wrapperClassName?: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  peers: readonly MentionPeer[];
  everyone?: boolean;
  /** Ranges the composer marked as ambiguous; drawn as a dashed underline. */
  marks?: readonly TextMark[];
  /** Words already clarified: a solid accent underline. */
  clarified?: readonly TextMark[];
  /** The word whose panel is open: a quiet yellow background. */
  activeMark?: TextMark | null;
  onMarkClick?: (index: number, rect: DOMRect) => void;
}) {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [activeRects, setActiveRects] = useState<Array<{ left: number; top: number; width: number; height: number }>>([]);
  const sync = useCallback(() => {
    const input = inputRef.current;
    const mirror = mirrorRef.current;
    if (!input || !mirror) return;
    const style = getComputedStyle(input);
    for (const property of TEXT_LAYOUT) mirror.style.setProperty(property, style.getPropertyValue(property));
    mirror.style.width = `${input.clientWidth}px`;
    mirror.scrollTop = input.scrollTop;
    mirror.scrollLeft = input.scrollLeft;
  }, [inputRef]);
  const resize = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const scrollTop = input.scrollTop;
    const line = parseFloat(getComputedStyle(input).lineHeight) || 24;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, line * 6)}px`;
    input.scrollTop = scrollTop;
    sync();
  }, [inputRef, sync]);
  useLayoutEffect(resize, [props.value, props.className, resize]);
  useLayoutEffect(() => {
    const registry = (CSS as unknown as { highlights?: { set(name: string, value: unknown): void; delete(name: string): void } }).highlights;
    const HighlightCtor = (window as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
    if (registry && HighlightCtor && mirrorRef.current) {
      const ranges = (list?: readonly TextMark[]) => (list ?? []).map((mark) => offsetRange(mirrorRef.current!, mark.start, mark.end)).filter((range): range is Range => Boolean(range));
      const ambiguous = ranges(marks);
      const settled = ranges(clarified);
      if (ambiguous.length) registry.set("omb-ambiguous", new HighlightCtor(...ambiguous));
      else registry.delete("omb-ambiguous");
      if (settled.length) registry.set("omb-clarified", new HighlightCtor(...settled));
      else registry.delete("omb-clarified");
    }
    const wrapper = mirrorRef.current?.parentElement;
    const range = activeMark && mirrorRef.current ? offsetRange(mirrorRef.current, activeMark.start, activeMark.end) : null;
    if (!range || !wrapper) {
      setActiveRects([]);
      return;
    }
    const box = wrapper.getBoundingClientRect();
    setActiveRects(Array.from(range.getClientRects()).map((rect) => ({ left: rect.left - box.left, top: rect.top - box.top, width: rect.width, height: rect.height })));
  }, [activeMark, clarified, marks, props.value]);
  useLayoutEffect(() => {
    let width = inputRef.current?.clientWidth;
    const observer = new ResizeObserver(() => {
      // Observe width only, so setting the measured height cannot create a resize loop.
      const nextWidth = inputRef.current?.clientWidth;
      if (nextWidth !== width) { width = nextWidth; resize(); }
      else sync();
    });
    if (inputRef.current) observer.observe(inputRef.current);
    return () => observer.disconnect();
  }, [inputRef, resize, sync]);
  return <div className={cn("mention-editor relative min-w-0 flex-1 self-center", wrapperClassName)}>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {activeRects.map((rect, index) => (
        <span key={index} className="absolute rounded-[3px] bg-[color-mix(in_srgb,var(--identity-yellow)_30%,transparent)]" style={rect} />
      ))}
    </div>
    <div ref={mirrorRef} dir={props.dir} aria-hidden="true" className="mention-editor-mirror pointer-events-none absolute inset-0 overflow-hidden">
      <MentionText text={String(props.value ?? "")} peers={peers} everyone={everyone} bare />{"\n"}
    </div>
    <textarea {...props} ref={inputRef} onScroll={(event) => { sync(); props.onScroll?.(event); }}
      onClick={(event) => {
        props.onClick?.(event);
        if (!marks?.length || !onMarkClick || !inputRef.current || !mirrorRef.current) return;
        const at = inputRef.current.selectionStart ?? 0;
        const index = marks.findIndex((mark) => at >= mark.start && at <= mark.end);
        if (index < 0) return;
        const range = offsetRange(mirrorRef.current, marks[index]!.start, marks[index]!.end);
        const rect = range?.getBoundingClientRect();
        if (rect) onMarkClick(index, rect);
      }} />
  </div>;
}
