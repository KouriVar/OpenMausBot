import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initialDesktopCapabilities } from "@/lib/desktop";
import { setLocale } from "@/lib/i18n";
import type { SidebarDensity } from "@/lib/sidebar-preferences";
import { StoreProvider } from "@/state/store";

const fixture = vi.hoisted(() => ({
  density: "comfortable" as SidebarDensity,
  advanced: false,
  windowChrome: undefined as "mac-inset" | "win-caption" | "native" | undefined,
  windowFrame: undefined as boolean | undefined,
  hostLabel: undefined as string | undefined,
  rail: null as { available: boolean; hidden: boolean } | null,
}));

vi.mock("@/lib/sidebar-preferences", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/sidebar-preferences")>(),
  useSidebarDensity: () => fixture.density,
}));
vi.mock("@/lib/interface-mode", () => ({ useAdvancedMode: () => fixture.advanced, setAdvancedMode: () => {} }));
vi.mock("@/lib/chrome-rail", () => ({ useChromeRail: () => fixture.rail, setChromeRailHidden: () => {} }));
vi.mock("./DesktopCapabilities", async (importOriginal) => ({
  ...await importOriginal<typeof import("./DesktopCapabilities")>(),
  useDesktopCapabilities: () => {
    const capabilities = initialDesktopCapabilities();
    const host = { ...capabilities.host, label: fixture.hostLabel ?? capabilities.host.label };
    return { capabilities: { ...capabilities, host, windowChrome: fixture.windowChrome, windowFrame: fixture.windowFrame }, ready: true };
  },
}));

import { Sidebar } from "./Sidebar";

const render = () => renderToStaticMarkup(
  createElement(StoreProvider, null, createElement(Sidebar, { open: true, onClose: () => {} })),
);

beforeEach(() => {
  fixture.density = "comfortable";
  fixture.advanced = false;
  fixture.windowChrome = undefined;
  fixture.windowFrame = undefined;
  fixture.hostLabel = undefined;
  fixture.rail = null;
  vi.stubGlobal("window", { innerWidth: 1280, location: { protocol: "http:", search: "" } });
  setLocale("en");
});

afterEach(() => {
  vi.unstubAllGlobals();
  setLocale("en");
});

/** Fork: both modes wear Simple's chrome, so every shell expectation holds for Advanced too. */
const MODES = [{ advanced: false, name: "Simple" }, { advanced: true, name: "Advanced" }] as const;

describe("the sidebar shell, in both modes", () => {
  it.each(MODES)("$name keeps the + in the list and no Inbox button anywhere: the Inbox is a row of the account menu", ({ advanced }) => {
    fixture.advanced = advanced;

    fixture.density = "comfortable";
    const list = render();
    // Fork 0.6.10: the Inbox moved into the account's menu, so no sidebar bar carries its button any more.
    expect(list).not.toContain('aria-label="Inbox"');
    expect(list).toContain('aria-label="New or share"');
    expect(list).not.toContain('aria-label="Active Threads"');

    fixture.density = "icons";
    const rail = render();
    expect(rail).not.toContain('aria-label="Inbox"');
    expect(rail).not.toContain('aria-label="New or share"');
    expect(rail).toContain("data-sidebar-account");
    expect(rail).toContain('role="separator" aria-label="Resize sidebar"');
  });

  it.each(MODES)("$name has no footer tools section: its rows live in the account's menu", ({ advanced }) => {
    fixture.advanced = advanced;
    const html = render();
    expect(html).not.toContain('data-sidebar-nav="automations"');
    expect(html).not.toContain('data-sidebar-nav="team-map"');
    expect(html).not.toContain('data-sidebar-nav="routines"');
  });

  it.each(MODES)("$name draws the account's footer, with the place pill in the head", ({ advanced }) => {
    fixture.advanced = advanced;
    const html = render();
    const head = html.indexOf('data-glass-bar="top"');
    const topRow = html.indexOf("data-sidebar-top-row");
    const list = html.indexOf('data-scroll-fade-frame=""');
    const foot = html.indexOf('data-glass-bar="bottom"');
    expect(head).toBeGreaterThan(-1);
    expect(head).toBeLessThan(topRow);
    expect(topRow).toBeLessThan(list);
    expect(list).toBeLessThan(foot);
    expect(html.slice(foot)).toContain('data-sidebar-footer="simple"');
    expect(html).toContain("data-sidebar-top-slot");
    expect(html.match(/data-glass-frame=""/g)).toHaveLength(1);
  });

  it.each(MODES)("$name collapses to the same 92px rail", ({ advanced }) => {
    fixture.advanced = advanced;
    fixture.density = "icons";
    const html = render();
    const aside = /<aside[^>]*\bclass="([^"]*)"/.exec(html)?.[1] ?? "";
    expect(aside).toContain("w-[92px]");
    expect(html).toContain("data-sidebar-rail-footer");
  });

  it.each(MODES)("$name has no collapse button: the edge is dragged instead", ({ advanced }) => {
    fixture.advanced = advanced;
    expect(render()).not.toContain("data-sidebar-edge-toggle");
    expect(render()).toMatch(/role="separator" aria-label="Resize sidebar"/);
  });
});

describe("the places rail toggle", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { innerWidth: 1280, location: { protocol: "http:", search: "" }, ogb: { workspaces: { state: () => new Promise(() => {}), menu: () => Promise.resolve() } } });
    fixture.windowChrome = "mac-inset";
    fixture.rail = { available: true, hidden: false };
  });

  it("stays in the window frame's top bar on macOS and Windows", () => {
    for (const windowChrome of ["mac-inset", "win-caption"] as const) {
      fixture.windowChrome = windowChrome;
      for (const { advanced } of MODES) {
        for (const density of ["comfortable", "icons"] as const) {
          fixture.advanced = advanced;
          fixture.density = density;
          expect(render(), `${windowChrome}, ${advanced ? "Advanced" : "Simple"}, ${density}`).not.toContain("data-rail-toggle");
        }
      }
    }
  });

  it("leads the row on Linux", () => {
    fixture.windowChrome = "native";
    fixture.hostLabel = "Linux";
    const html = render();
    expect(html.indexOf("data-rail-toggle")).toBeGreaterThan(-1);
    expect(html).toMatch(/data-rail-toggle="true"[^>]*aria-label="Hide your computers"/);
  });

  it("is nowhere without a rail to hide", () => {
    for (const rail of [null, { available: false, hidden: false }, { available: false, hidden: true }]) {
      fixture.rail = rail;
      expect(render()).not.toContain("data-rail-toggle");
    }
  });
});
