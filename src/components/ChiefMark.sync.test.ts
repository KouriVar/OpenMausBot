// @vitest-environment happy-dom
// Switching a Chief's mark in Settings has to reach every badge in the same window: the sidebar row, the chat head and
// the settings card all read the one file, and the choice itself announces itself (a same-window write raises no
// "storage" event, so the fork's own event does it).
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Bot } from "@/state/store";

vi.mock("@/lib/i18n", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/i18n")>(), t: (key: string) => key }));

import { setChiefStyle, useChiefStyle } from "@/fork/chief-style";
import { chiefMark } from "@/fork/chief-mark";
import { chiefOfStaffBadge } from "./BotRole";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const store = new Map<string, string>();
const memory = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
};

const bot = { id: "atlas", name: "Atlas", title: "", chiefOfStaff: true } as unknown as Bot;

/** The sidebar row's own wiring: the mark, chosen by this bot's setting. */
function SidebarRow({ candidate }: { candidate: Bot }) {
  const Mark = chiefMark(useChiefStyle(candidate.id));
  return createElement("span", { "data-testid": "row-chief" }, createElement(Mark, { size: 13 }));
}

/** The chat head's wiring: ChatView subscribes and hands the choice to the badge. */
function ChatHead({ candidate }: { candidate: Bot }) {
  const style = useChiefStyle(candidate.id);
  return createElement("span", { "data-testid": "head-chief" }, chiefOfStaffBadge(candidate, style));
}

let root: Root;
beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", memory);
  root = createRoot(document.body.appendChild(document.createElement("div")));
});
afterEach(() => {
  act(() => root.unmount());
  store.clear();
});

const marks = () => ({
  row: document.querySelector("[data-testid=row-chief]")!.innerHTML,
  head: document.querySelector("[data-testid=head-chief]")!.innerHTML,
});

describe("a Chief's mark, after the person switches it", () => {
  it("changes in the sidebar row and the chat head at once, with no reload", async () => {
    await act(async () => root.render(createElement("div", null, createElement(SidebarRow, { candidate: bot }), createElement(ChatHead, { candidate: bot }))));
    const before = marks();
    expect(before.row).toContain("lucide-crown");
    expect(before.head).toContain("lucide-crown");

    await act(async () => setChiefStyle(bot.id, "lead"));

    const after = marks();
    expect(after.row).toContain("lucide-flag");
    expect(after.row).not.toContain("lucide-crown");
    expect(after.head).toContain("lucide-flag");
    expect(after.head).not.toContain("lucide-crown");

    await act(async () => setChiefStyle(bot.id, "crown"));
    expect(marks().row).toContain("lucide-crown");
    expect(marks().head).toContain("lucide-crown");
  });

  it("leaves another bot's Chief alone", async () => {
    await act(async () => root.render(createElement(SidebarRow, { candidate: bot })));
    await act(async () => setChiefStyle("someone-else", "lead"));
    expect(document.querySelector("[data-testid=row-chief]")!.innerHTML).toContain("lucide-crown");
  });
});
