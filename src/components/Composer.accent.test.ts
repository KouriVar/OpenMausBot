// @vitest-environment happy-dom
// With Bloub on, the composer's voice and Send buttons take the colour the bot's avatar paints — the
// same value your own bubble uses — instead of the bot's old MausBot colour.
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bot } from "@/state/store";
import { restoreComposerDraft } from "@/lib/drafts";
import { BOT_BUTTON, botButtonTone, botButtonToneHex } from "@/lib/bot-button";
import { contrastRatio } from "@/lib/color-contrast";
import { bloubMid, defaultBloubSkin, saveBloubSkin, BLOUB_SKIN_PREFIX } from "@/fork/bloub-skin";
import { FORK_AVATAR_STYLE_KEY } from "@/fork/avatar-style";

const fixture = vi.hoisted(() => ({ advanced: false, dispatch: vi.fn() }));

vi.mock("@/state/store", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/state/store")>();
  return { ...original, useStore: () => ({ state: original.initialState, dispatch: fixture.dispatch }) };
});
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/lib/cloud-guest", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/cloud-guest")>(), useReactor: () => "user" }));
vi.mock("@/lib/use-owner-or-admin", () => ({ useOwnerOrAdmin: () => true }));
vi.mock("@/lib/interface-mode", () => ({ useAdvancedMode: () => fixture.advanced, setAdvancedMode: vi.fn() }));
vi.mock("@/lib/use-composer-dictation", () => ({
  useComposerDictation: () => ({ recording: false, ready: true, speechError: null, toggle: vi.fn(), stop: vi.fn() }),
}));
vi.mock("@/lib/desktop-capabilities", () => ({ useDesktopCapabilities: () => ({ capabilities: {}, ready: true }) }));
vi.mock("./CallView", () => ({ CallButton: () => null }));
vi.mock("./GroupCallView", () => ({ GroupCallButton: () => null }));

import { Composer } from "./Composer";

const bot: Bot = {
  id: "atlas", threadId: "atlas-thread", name: "Atlas", title: "", description: "",
  color: "teal", notifications: false, unread: false, busy: false, messages: [], approvalMode: "ask",
  modelSelection: { instanceId: "claude-test", model: "fake" },
};

let root: Root;
let container: HTMLDivElement;
const render = (props: Parameters<typeof Composer>[0]) => flushSync(() => root.render(createElement(Composer, props)));
const sendButton = () => container.querySelector<HTMLButtonElement>('button[aria-label="Send message"]');
const micButton = () => container.querySelector<HTMLButtonElement>('button[aria-label="Start dictation"]');

/** A Bloub colour's button tone in either scheme; happy-dom does not settle which one the app paints. */
const tonesFor = (color: string) => ["light", "dark"].map((scheme) => botButtonToneHex(bloubMid(color, scheme as "light" | "dark")));
const CYAN = "cyan";
const MAGENTA = "magenta";

/** The button carries one of the avatar's tones, with the hover and press steps derived from it. */
function expectOneColour(button: HTMLElement | null, color = CYAN) {
  expect(button?.className.split(" ")).toContain(BOT_BUTTON);
  const fill = button!.style.getPropertyValue("--bot-button");
  const tone = tonesFor(color).find((candidate) => candidate.fill === fill);
  expect(tone, `${color} button fill ${fill}`).toBeDefined();
  expect(button?.style.getPropertyValue("--bot-button-ink")).toBe(tone!.ink);
  expect(button?.style.getPropertyValue("--bot-button-hover")).toBe(tone!.hover);
  expect(button?.style.getPropertyValue("--bot-button-pressed")).toBe(tone!.pressed);
  return tone!;
}

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, value),
  };
}

beforeEach(() => {
  fixture.advanced = false;
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, "scrollIntoView").mockImplementation(() => {});
  const storage = memoryStorage();
  vi.stubGlobal("localStorage", storage);
  storage.setItem(FORK_AVATAR_STYLE_KEY, "bloub");
  saveBloubSkin(bot.id, { ...defaultBloubSkin(bot.color), color: CYAN });
  restoreComposerDraft(`bot:${bot.id}:${bot.threadId}`, { text: "", attachments: [] });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  flushSync(() => root.unmount());
  container.remove();
  document.body.innerHTML = "";
  globalThis.localStorage?.removeItem(FORK_AVATAR_STYLE_KEY);
  globalThis.localStorage?.removeItem(BLOUB_SKIN_PREFIX + bot.id);
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("the composer's buttons in a Bloub chat", () => {
  it("paints the voice button in the avatar's colour, not the bot's old colour", () => {
    render({ bot });
    const tone = expectOneColour(micButton());
    expect(tone.fill).not.toBe(botButtonTone(bot.color).fill);
  });

  it("paints Send the same colour, and keeps the icon above 4.5:1", () => {
    restoreComposerDraft(`bot:${bot.id}:${bot.threadId}`, { text: "hello", attachments: [] });
    render({ bot });
    const tone = expectOneColour(sendButton());
    expect(contrastRatio(tone.ink, tone.fill)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tone.ink, tone.hover)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tone.ink, tone.pressed)).toBeGreaterThanOrEqual(4.5);
  });

  it("paints the black avatar's voice and Send buttons from its own black", () => {
    // happy-dom reports the dark scheme, so the black avatar paints its white end here; the light end
    // (#2c2c2c fill, white icon) is the same tone the bubble and the hex tests read.
    const lightTone = botButtonToneHex("#2c2c2c");
    expect(lightTone.fill).toBe("#2c2c2c");
    expect(lightTone.ink).toBe("#ffffff");
    expect(contrastRatio(lightTone.ink, lightTone.fill)).toBeGreaterThanOrEqual(4.5);

    flushSync(() => saveBloubSkin(bot.id, { ...defaultBloubSkin(bot.color), color: "black" }));
    restoreComposerDraft(`bot:${bot.id}:${bot.threadId}`, { text: "hello", attachments: [] });
    render({ bot });
    for (const button of [micButton(), sendButton()]) {
      expect(button?.className.split(" ")).toContain(BOT_BUTTON);
      const fill = button!.style.getPropertyValue("--bot-button");
      const ink = button!.style.getPropertyValue("--bot-button-ink");
      const tone = tonesFor("black").find((candidate) => candidate.fill === fill);
      expect(tone, `black button fill ${fill}`).toBeDefined();
      expect(ink).toBe(tone!.ink);
      expect(contrastRatio(ink, fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("follows the avatar when its colour changes, with no reload", () => {
    restoreComposerDraft(`bot:${bot.id}:${bot.threadId}`, { text: "hello", attachments: [] });
    render({ bot });
    const before = sendButton()!.style.getPropertyValue("--bot-button");
    flushSync(() => saveBloubSkin(bot.id, { ...defaultBloubSkin(bot.color), color: MAGENTA }));
    const after = sendButton()!.style.getPropertyValue("--bot-button");
    expect(after).not.toBe(before);
    expect(tonesFor(MAGENTA).map((tone) => tone.fill)).toContain(after);
    expect(tonesFor(CYAN).map((tone) => tone.fill)).not.toContain(after);
  });
});
