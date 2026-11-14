import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GlassBar, GlassScrollFrame, GlassScroller, publishGlassInsets } from "./GlassScrollFrame";

function child(glassBar: string | undefined, height: number) {
  return { dataset: glassBar === undefined ? {} : { glassBar }, getBoundingClientRect: () => ({ height }) };
}

function frame(children: ReturnType<typeof child>[]) {
  const vars = new Map<string, string>();
  const element = { children, style: { setProperty: (name: string, value: string) => vars.set(name, value) } };
  publishGlassInsets(element as unknown as HTMLElement);
  return vars;
}

describe("publishGlassInsets", () => {
  it("publishes each bar's height, rounded up so no row ever tucks under a sub-pixel edge", () => {
    const vars = frame([child("top", 120.4), child(undefined, 900), child("bottom", 186)]);
    expect(vars.get("--glass-top")).toBe("121px");
    expect(vars.get("--glass-bottom")).toBe("186px");
  });

  it("publishes 0px for an edge without a bar, so a header-only frame keeps no bottom gap", () => {
    const vars = frame([child("top", 64), child(undefined, 500)]);
    expect(vars.get("--glass-top")).toBe("64px");
    expect(vars.get("--glass-bottom")).toBe("0px");
  });

  it("ignores everything that is not a bar, the scroller included", () => {
    const vars = frame([child(undefined, 700), child("sideways", 40)]);
    expect(vars.get("--glass-top")).toBe("0px");
    expect(vars.get("--glass-bottom")).toBe("0px");
  });
});

describe("the stacked frame", () => {
  const frameHtml = (stacked: boolean) => renderToStaticMarkup(createElement(GlassScrollFrame, { stacked, children: [
    createElement(GlassBar, { key: "head", edge: "top", children: "head" }),
    createElement(GlassScroller, { key: "rows", children: "rows" }),
    createElement(GlassBar, { key: "foot", edge: "bottom", children: "foot" }),
  ] }));

  it("stacks the bars around the list and clips it hard, with no fade band at either edge", () => {
    const html = frameHtml(true);
    expect(html).toMatch(/^<div data-glass-frame="" class="relative min-h-0 flex flex-col">/);
    expect(html).toContain('<div data-glass-bar="top" class="relative z-10 shrink-0">head</div>');
    expect(html).toContain('<div data-glass-bar="bottom" class="relative z-10 shrink-0">foot</div>');
    expect(html).toContain('<div class="min-h-0 flex-1 overflow-y-auto"><div>rows</div></div>');
    expect(html).not.toContain("scroll-fade");
    expect(html).not.toContain("mask-image");
    expect(html).not.toContain("gradient");
  });

  it("keeps the floating glass bars when the frame is not stacked", () => {
    const html = frameHtml(false);
    expect(html).toContain('<div data-glass-bar="top" class="glass-bar absolute inset-x-0 z-10 top-0">head</div>');
    expect(html).toContain('<div class="glass-scroller h-full overflow-y-auto"><div class="glass-scroller-content">rows</div></div>');
    expect(html).not.toContain("scroll-fade");
  });
});

describe("a fading bar", () => {
  const css = readFileSync("src/styles.css", "utf8");
  const rule = (selector: string) => css.match(new RegExp(`(?:^|\\n)${selector.replace(/[[\]().:"]/g, "\\$&")} \\{[^}]*\\}`))?.[0] ?? "";

  it("marks itself, and a plain bar stays glass", () => {
    const fading = renderToStaticMarkup(createElement(GlassBar, { edge: "top", fade: true, children: "x" }));
    const glass = renderToStaticMarkup(createElement(GlassBar, { edge: "top", children: "x" }));
    expect(fading).toContain('data-glass-fade=""');
    expect(glass).not.toContain("data-glass-fade");
  });

  it("fades into the canvas with no tint or blur: hidden at the edge, full strength over its last 60px", () => {
    const fade = rule('.glass-bar[data-glass-fade]::before');
    expect(fade).toContain("linear-gradient(to bottom, var(--color-app), var(--color-app) calc(100% - var(--glass-fade)), transparent)");
    expect(fade).toMatch(/[^-]backdrop-filter: none/);
    expect(fade).toContain("mask-image: none");
    expect(rule('.glass-bar[data-glass-fade]')).toContain("--glass-fade: 60px");
  });
});
