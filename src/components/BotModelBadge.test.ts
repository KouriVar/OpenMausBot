import { createElement, type MemoExoticComponent, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialState, type AppState, type Bot, type InstanceInfo } from "@/state/store";
import type { SidebarDensity } from "@/lib/sidebar-preferences";

const fixture = vi.hoisted(() => ({ state: {} as Partial<AppState>, advanced: true }));
vi.mock("@/lib/thread-preferences", () => ({ useShowThreads: () => false }));
vi.mock("@/lib/interface-mode", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/interface-mode")>(),
  useAdvancedMode: () => fixture.advanced,
}));
vi.mock("./DesktopCapabilities", () => ({ useDesktopCapabilities: () => ({}) }));
vi.mock("react-dom", () => ({ createPortal: (node: ReactNode) => node }));
vi.mock("@/state/store", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/state/store")>();
  return { ...original, useStore: () => ({ state: { ...original.initialState, ...fixture.state }, dispatch: vi.fn() }) };
});

import { BotModelBadge, botModel } from "./BotModelBadge";
import { BotListItem, botRowProps, type BotRowProps } from "./Sidebar";

const claude = {
  instanceId: "claude", driverKind: "claudeAgent", displayName: "Claude", snapshot: { state: "available" },
  models: { default: "sonnet", options: [{ id: "sonnet", label: "Sonnet 4.5" }, { id: "opus", label: "Opus 4.1" }] },
} as InstanceInfo;
const bot = (instanceId: string, model: string): Bot => ({
  id: "atlas", threadId: "t", name: "Atlas", title: "", description: "", color: "green",
  notifications: true, unread: false, messages: [], modelSelection: { instanceId, model },
});

describe("botModel", () => {
  it("names the bot's chosen model by its picker label", () => {
    expect(botModel(bot("claude", "opus"), [claude])).toEqual({ instance: claude, label: "Opus 4.1" });
  });

  it("names the engine's default model when the bot has not chosen one", () => {
    expect(botModel(bot("claude", ""), [claude])?.label).toBe("Sonnet 4.5");
  });

  it("falls back to the raw id of a model the engine does not list", () => {
    expect(botModel(bot("claude", "claude-custom-7"), [claude])?.label).toBe("claude-custom-7");
  });

  it("finds nothing for an engine that is not installed", () => {
    expect(botModel(bot("gone", "opus"), [claude])).toBeNull();
  });
});

describe("BotModelBadge", () => {
  it("draws the engine mark, names only the model on hover and the engine too for screen readers", () => {
    const markup = renderToStaticMarkup(createElement(BotModelBadge, { bot: bot("claude", "opus"), instances: [claude], avatarSize: 44 }));
    expect(markup).toContain('data-testid="model-badge"');
    expect(markup).toContain('aria-label="Model: Opus 4.1 (Claude)"');
    expect(markup).toContain('title="Opus 4.1"');
    expect(markup).toContain("<svg");
  });

  it("draws nothing for an engine that is not installed", () => {
    expect(renderToStaticMarkup(createElement(BotModelBadge, { bot: bot("gone", "opus"), instances: [claude], avatarSize: 44 }))).toBe("");
  });
});

describe("sidebar bot row", () => {
  const botRow = (BotListItem as MemoExoticComponent<(props: BotRowProps) => ReactNode>).type;
  const render = (candidate: Bot, density: SidebarDensity) => renderToStaticMarkup(createElement(botRow,
    botRowProps({ ...initialState, ...fixture.state }, vi.fn(), candidate, { density, query: "", onMenu: vi.fn() })));
  const badges = (markup: string) => markup.match(/<span data-testid="model-badge"[^>]*>/g) ?? [];

  beforeEach(() => {
    fixture.state = { bots: [bot("claude", "opus")], instances: [claude], activeView: "chat", selectedId: "other" };
    fixture.advanced = true;
    vi.stubGlobal("window", { innerWidth: 1024, innerHeight: 768 });
    vi.stubGlobal("document", { body: {} });
    vi.stubGlobal("HTMLInputElement", class {});
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  // Fork: the fork's rows carry no engine badge and no chief crown (FORK_HIDE_BOT_BADGES) — one quiet row instead. The
  // model still reaches the person in the row's tooltip wherever the row has one, so nothing is lost but the mark.
  it.each<SidebarDensity>(["comfortable", "icons"])("draws no model badge in an Advanced %s row", (density) => {
    const markup = render(bot("claude", "opus"), density);
    expect(badges(markup)).toHaveLength(0);
    if (density === "icons") expect(markup).toContain('title="Atlas · Model: Opus 4.1 (Claude)"');
  });

  it.each<SidebarDensity>(["comfortable", "icons"])("draws no model badge in a Simple mode %s row, keeping the model in its tooltip", (density) => {
    fixture.advanced = false;
    const markup = render(bot("claude", "opus"), density);
    expect(badges(markup)).toHaveLength(0);
    expect(markup).toContain("Model: Opus 4.1 (Claude)");
  });

  it("shows no badge while the bot's engine is missing", () => {
    expect(render(bot("gone", "opus"), "comfortable")).not.toContain('data-testid="model-badge"');
  });
});
