// fork 定制：头像只保留右下单点，合上游时此处一律取我方。
// Fork: one status dot per avatar, bottom-right; an upstream merge always keeps our side here.
//
// This guard runs against the real sidebar components: a bot row (both densities), a tile, and a
// Bloub body. It fails the moment a second indicator (a row dot, a corner dot, or a dot painted on
// the mascot) comes back, so CI cannot go green with the three-dot avatar again.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initialState, type Bot } from "@/state/store";

vi.mock("./DesktopCapabilities", () => ({ useDesktopCapabilities: () => ({}) }));
vi.mock("@/lib/interface-mode", async (original) => ({
  ...await original<typeof import("@/lib/interface-mode")>(),
  useAdvancedMode: () => true,
}));
// The Bloub body is the one that used to paint its own notification dot, so the guard renders it.
vi.mock("@/fork/avatar-style", async (original) => ({
  ...await original<typeof import("@/fork/avatar-style")>(),
  useForkAvatarStyle: () => "bloub",
}));

import { BotListItem, botRowProps } from "./Sidebar";
import { SidebarBotTile } from "./SidebarTiles";

const bot = (extra: Partial<Bot> = {}): Bot => ({
  id: "atlas", threadId: "thread-atlas", name: "Atlas", title: "", description: "", notifications: true,
  color: "green", unread: false, modelSelection: { instanceId: "claude", model: "test" }, messages: [], ...extra,
});

const row = (candidate: Bot, density: "comfortable" | "icons") =>
  renderToStaticMarkup(createElement(BotListItem, botRowProps(initialState, vi.fn(), candidate, { density, query: "", onMenu: vi.fn() })));

const tile = (candidate: Bot, primary = false) =>
  renderToStaticMarkup(createElement(SidebarBotTile, { ...botRowProps(initialState, vi.fn(), candidate, { density: "comfortable", query: "", onMenu: vi.fn() }), primary }));

/** Every state that used to add a mark of its own. */
const STATES: Array<[string, Partial<Bot>]> = [
  ["unread", { unread: true }],
  ["working", { busy: true }],
  ["waiting on you", { activity: "waiting-on-you" }],
  ["engine gone", { activity: "dead" }],
  ["waiting on a teammate", { waitingForTeammates: true }],
  ["failed turn", { messages: [{ id: "f", role: "bot", kind: "activity", text: "The provider refused", at: 1, tool: { name: "error: The provider refused", ok: false } }] as Bot["messages"] }],
];

const dots = (markup: string) => markup.match(/data-avatar-dot=/g) ?? [];

beforeEach(() => {
  vi.stubGlobal("window", { innerWidth: 1280, innerHeight: 800 });
  vi.stubGlobal("HTMLInputElement", class {});
});
afterEach(() => vi.unstubAllGlobals());

describe("the fork's one-dot rule", () => {
  it.each(STATES)("wears at most one status dot on a row in either density (%s)", (_state, extra) => {
    for (const density of ["comfortable", "icons"] as const) {
      const markup = row(bot(extra), density);
      expect(dots(markup).length, `${density} row, ${_state}`).toBeLessThanOrEqual(1);
      // The icons rail's row-level unread dot: the third blue dot's top-right sibling.
      expect(markup).not.toContain("pointer-events-none absolute size-2 rounded-full border border-panel bg-accent");
    }
  });

  it.each(STATES)("wears at most one status dot on a tile (%s)", (_state, extra) => {
    for (const primary of [true, false]) {
      expect(dots(tile(bot(extra), primary)).length, `primary=${primary}, ${_state}`).toBeLessThanOrEqual(1);
    }
  });

  it("draws no dot on the mascot body: unread is the avatar's dot, not a glyph on the face", () => {
    const markup = row(bot({ unread: true }), "icons");
    // Bloub's frame.notif circle, the mid-right blue dot.
    expect(markup).not.toContain("#2496e8");
    expect(dots(markup)).toHaveLength(1);
  });
});
