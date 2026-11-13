// @vitest-environment happy-dom
// The Settings window must leave this fork's interface mode alone. Spending is a page only Advanced shows, and Advanced
// draws a different bot side panel, so landing there used to flip the mode and take the chat head's panel away for the
// rest of the session (the pill then opened Advanced's settings list, never the bot panel).
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setLocale } from "@/lib/i18n";
import type { AppSettingsSection } from "@/state/store";

const fixture = vi.hoisted(() => ({
  section: "usage" as AppSettingsSection,
  config: {} as Record<string, unknown>,
  dispatch: vi.fn(),
}));
vi.mock("@/state/store", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/state/store")>(),
  api: vi.fn(() => new Promise(() => {})),
  useStore: () => ({
    state: { appSettingsSection: fixture.section, appSettingsPhonePairing: 0, appSettingsCloudLink: 0, instances: [], bots: [], config: fixture.config, activeView: "chat" },
    dispatch: fixture.dispatch,
  }),
}));
vi.mock("@/lib/use-owner-or-admin", () => ({ useOwnerOrAdmin: () => true }));
vi.mock("@/lib/analytics", () => ({ analyticsEnabled: () => false, setAnalyticsEnabled: vi.fn(), track: vi.fn() }));
vi.mock("../DesktopCapabilities", () => ({ useDesktopCapabilities: () => ({ capabilities: { host: { platform: "darwin" } } }), windowFramed: () => false }));

import { ADVANCED_MODE_KEY, readAdvancedMode } from "@/lib/interface-mode";
import { SettingsModal } from "../SettingsModal";

type Bridge = NonNullable<typeof window.ogb>;
const bridge = {
  platform: "darwin",
  companion: { state: () => new Promise(() => {}) },
  environments: { state: () => new Promise(() => {}) },
} as unknown as Bridge;
// happy-dom here has no storage of its own; the mode lives in the window's.
function memoryStorage(): Storage {
  const held = new Map<string, string>();
  return {
    get length() { return held.size; },
    clear: () => { held.clear(); },
    getItem: (key) => held.get(key) ?? null,
    key: (index) => [...held.keys()][index] ?? null,
    removeItem: (key) => { held.delete(key); },
    setItem: (key, value) => { held.set(key, String(value)); },
  };
}
let storage: Storage;

let host: HTMLDivElement;
let root: Root;
const settle = async () => {
  for (let i = 0; i < 4; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};
const currentPage = () => document.querySelector('[data-settings-page][aria-current="page"]')?.getAttribute("data-settings-page") ?? null;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", () => new Promise(() => {}));
  storage = memoryStorage();
  Object.defineProperty(window, "localStorage", { value: storage, configurable: true });
  // An unlocked device is the one that could switch modes; the window must not do it for them.
  storage.setItem("omb-advanced-unlocked", "1");
  window.ogb = bridge;
  setLocale("en");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  flushSync(() => root.unmount());
  host.remove();
  delete window.ogb;
  vi.unstubAllGlobals();
  storage.clear();
  setLocale("en");
});

describe("the Settings window and this fork's mode", () => {
  it("lands on Spending without turning Advanced on, and marks the page in the menu", async () => {
    expect(readAdvancedMode()).toBe(false);
    flushSync(() => root.render(createElement(SettingsModal)));
    await settle();
    expect(document.querySelector('[data-settings-page-open="usage"]')).not.toBeNull();
    expect(currentPage()).toBe("usage");
    expect(readAdvancedMode()).toBe(false);
    expect(storage.getItem(ADVANCED_MODE_KEY)).toBeNull();
  });

  it("leaves a Simple page alone", async () => {
    fixture.section = "appearance";
    flushSync(() => root.render(createElement(SettingsModal)));
    await settle();
    expect(currentPage()).toBe("appearance");
    expect(storage.getItem(ADVANCED_MODE_KEY)).toBeNull();
  });
});
