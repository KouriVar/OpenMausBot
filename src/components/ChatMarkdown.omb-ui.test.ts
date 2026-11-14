// @vitest-environment happy-dom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { InteractiveAnswerMode } from "../../shared/interactive-answers";
import { setLocale } from "@/lib/i18n";
import { StreamingReplyContext } from "@/state/live-reply";
import { BotEditorStore } from "@/state/store";

const ui = vi.hoisted(() => ({ advanced: true }));
vi.mock("@/lib/interface-mode", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/interface-mode")>(),
  useAdvancedMode: () => ui.advanced,
  readAdvancedMode: () => ui.advanced,
}));

import { ChatMarkdown, clearChatMarkdownCache } from "./ChatMarkdown";

const CARD = '{"type":"Card","title":"Plan","children":[{"type":"Text","value":"Inline"}]}';

type StoreValue = Parameters<typeof BotEditorStore>[0]["value"];

const store = (mode: InteractiveAnswerMode): StoreValue => ({
  state: { config: { features: { interactiveAnswers: mode } } },
  dispatch: vi.fn(),
  flushBotPatches: vi.fn(async () => null),
}) as unknown as StoreValue;

function draw(text: string, mode: InteractiveAnswerMode = "widgets", streaming = false): HTMLElement {
  const markup = renderToStaticMarkup(createElement(BotEditorStore, {
    value: store(mode),
    children: createElement(StreamingReplyContext.Provider, { value: streaming }, createElement(ChatMarkdown, { text })),
  }));
  const host = document.createElement("div");
  host.innerHTML = markup;
  return host;
}

const fence = (body: string) => `\`\`\`omb-ui\n${body}\n\`\`\``;

beforeEach(() => {
  setLocale("en");
  clearChatMarkdownCache();
  ui.advanced = true;
});

describe("a component fence in a reply", () => {
  it("draws the component where the fence sits in the reply", () => {
    const host = draw(`Before.\n\n${fence(CARD)}\n\nAfter.`);
    const card = host.querySelector("[data-widget]")!;
    expect(card).not.toBeNull();
    expect(card.getAttribute("data-widget-state")).toBe("view-only");
    expect(host.querySelector("[data-omb-ui-pending]")).toBeNull();
    const text = host.textContent ?? "";
    expect(text.indexOf("Before.")).toBeLessThan(text.indexOf("Plan"));
    expect(text.indexOf("Plan")).toBeLessThan(text.indexOf("After."));
  });

  it("draws the component under the widest setting too", () => {
    const host = draw(fence(CARD), "widgets+html");
    expect(host.querySelector("[data-widget]")).not.toBeNull();
  });

  it("draws it the same in Simple and Advanced", () => {
    const advanced = draw(fence(CARD));
    ui.advanced = false;
    clearChatMarkdownCache();
    const simple = draw(fence(CARD));
    expect(advanced.querySelector("[data-widget]")).not.toBeNull();
    expect(simple.querySelector("[data-widget]")).not.toBeNull();
    expect(simple.querySelector("[data-widget]")!.className).toBe(advanced.querySelector("[data-widget]")!.className);
  });

  it("keeps the surface of the card off, so a reply does not hold a card in a card", () => {
    const host = draw(fence(CARD));
    const card = host.querySelector<HTMLElement>("[data-widget]")!;
    expect(card.className).not.toContain("max-w-");
    const surface = card.firstElementChild as HTMLElement;
    expect(surface.className).toContain("w-full");
    expect(surface.className).not.toContain("bg-composer");
    expect(surface.className).not.toContain("ring-composer-ring");
    expect(surface.className).not.toContain("rounded-2xl");
  });

  it("is a plain code block when the setting is off", () => {
    const host = draw(fence(CARD), "off");
    expect(host.querySelector("[data-widget]")).toBeNull();
    expect(host.querySelector("[data-omb-ui-pending]")).toBeNull();
    expect(host.querySelector("pre")?.textContent).toContain('"type":"Card"');
  });

  it.each([
    ["text that is not JSON", "{not json"],
    ["a node type nothing renders", '{"type":"Card","children":[{"type":"Marquee"}]}'],
  ])("falls back to the same code block for %s, keeping the reply", (_case, body) => {
    const host = draw(`Before.\n\n${fence(body)}\n\nAfter.`);
    expect(host.querySelector("[data-widget]")).toBeNull();
    expect(host.querySelector("[data-omb-ui-pending]")).toBeNull();
    expect(host.querySelector("pre")?.textContent).toContain(body);
    expect(host.textContent).toContain("Before.");
    expect(host.textContent).toContain("After.");
  });

  it("is a plain code block when the setting is off, even for text that is not a widget", () => {
    const host = draw(`Before.\n\n${fence("{not json")}\n\nAfter.`, "off");
    expect(host.querySelector("pre")?.textContent).toContain("{not json");
    expect(host.textContent).toContain("After.");
  });
});

describe("a component fence while the reply streams", () => {
  it("shows a quiet placeholder until the fence closes", () => {
    const host = draw(`\`\`\`omb-ui\n${CARD}`, "widgets", true);
    const pending = host.querySelector("[data-omb-ui-pending]")!;
    expect(pending).not.toBeNull();
    expect(pending.getAttribute("aria-busy")).toBe("true");
    expect(host.querySelector("[data-widget]")).toBeNull();
  });

  it("shows the placeholder for a fence that follows text on the same block", () => {
    const host = draw(`Intro\n\`\`\`omb-ui\n${CARD}`, "widgets", true);
    expect(host.querySelector("[data-omb-ui-pending]")).not.toBeNull();
    expect(host.querySelector("[data-widget]")).toBeNull();
  });

  it("draws the component once the fence closes", () => {
    const host = draw(`${fence(CARD)}`, "widgets", true);
    expect(host.querySelector("[data-omb-ui-pending]")).toBeNull();
    expect(host.querySelector("[data-widget]")).not.toBeNull();
  });

  it("streams it as a code block when the setting is off", () => {
    const host = draw(`\`\`\`omb-ui\n${CARD}`, "off", true);
    expect(host.querySelector("[data-omb-ui-pending]")).toBeNull();
    expect(host.querySelector("[data-widget]")).toBeNull();
    expect(host.querySelector("pre")?.textContent).toContain('"type":"Card"');
  });
});
