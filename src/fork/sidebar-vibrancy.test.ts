// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applySidebarVibrancy,
  readGlassOverlay,
  readGlassTransparency,
  readSidebarVibrancy,
  setGlassOverlay,
  setGlassTransparency,
  vibrancyAvailable,
} from "./sidebar-vibrancy";

const store = new Map<string, string>();
const memory = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
};

beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", memory);
  Object.defineProperty(window, "ogb", { value: { platform: "darwin" }, configurable: true });
});

afterEach(() => {
  store.clear();
  document.documentElement.removeAttribute("data-sidebar-vibrancy");
  document.documentElement.removeAttribute("data-sidebar-glass");
  document.documentElement.removeAttribute("data-sidebar-overlay");
});

describe("the sidebar's vibrancy choices", () => {
  it("is on by default on a Mac, at 60% transparency, following the theme", () => {
    expect(vibrancyAvailable()).toBe(true);
    expect(readSidebarVibrancy()).toBe(true);
    expect(readGlassTransparency()).toBe(60);
    expect(readGlassOverlay()).toBe("auto");
  });

  it("keeps a chosen transparency and overlay, and ignores values it does not know", () => {
    setGlassTransparency(100);
    setGlassOverlay("light");
    expect(readGlassTransparency()).toBe(100);
    expect(readGlassOverlay()).toBe("light");
    memory.setItem("omb.fork.sidebarGlass", "37");
    memory.setItem("omb.fork.sidebarOverlay", "sepia");
    expect(readGlassTransparency()).toBe(60);
    expect(readGlassOverlay()).toBe("auto");
  });

  it("puts both choices on the document, where the styles read them", () => {
    setGlassTransparency(20);
    setGlassOverlay("dark");
    expect(document.documentElement.getAttribute("data-sidebar-vibrancy")).toBe("on");
    expect(document.documentElement.getAttribute("data-sidebar-glass")).toBe("20");
    expect(document.documentElement.getAttribute("data-sidebar-overlay")).toBe("dark");
    applySidebarVibrancy(false);
    expect(document.documentElement.getAttribute("data-sidebar-vibrancy")).toBeNull();
  });
});
