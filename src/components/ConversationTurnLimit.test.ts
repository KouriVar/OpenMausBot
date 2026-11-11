// @vitest-environment happy-dom
// Fork: the turn limit is a pill that opens the app's own menu (PillSelectMenu) instead of a native <select>, so its
// choices are read from the menu after clicking the pill, not from <option> markup.
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Group } from "@/state/store";

const { StoreContext } = await import("@/state/store");
const { ConversationTurnLimit } = await import("./ConversationTurnLimit");

const room = (tasks: Group["tasks"]): Group => ({
  id: "room",
  threadId: "launch",
  name: "Launch",
  memberIds: [],
  defaultResponder: { kind: "mentions" },
  bulletin: "",
  unread: false,
  createdAt: 1,
  messages: [],
  tasks,
});

let root: Root | undefined;
afterEach(() => {
  if (root) flushSync(() => root!.unmount());
  root = undefined;
  document.body.innerHTML = "";
});

function mount(group: Group) {
  const dispatch = vi.fn();
  const value = { state: { config: { rooms: { turnTimeoutMinutes: 5 } } }, dispatch } as never;
  const host = document.body.appendChild(document.createElement("div"));
  root = createRoot(host);
  flushSync(() => root!.render(createElement(StoreContext.Provider, { value }, createElement(ConversationTurnLimit, { group }))));
  const pill = host.querySelector<HTMLElement>('[data-testid="conversation-turn-limit"]')!;
  return { host, dispatch, pill };
}

/** The menu's radio rows, as [label, chosen] — the one row the menu marks with aria-checked. */
const choices = (host: HTMLElement) =>
  [...host.querySelectorAll<HTMLElement>('[role="menu"] [role="menuitemradio"]')]
    .map((row) => [row.textContent ?? "", row.getAttribute("aria-checked") === "true"] as const);

describe("conversation turn limit", () => {
  it("offers 30 minutes for this conversation and shows the group default", () => {
    const { host, pill } = mount(room([{ threadId: "launch", title: "Launch", createdAt: 1 }]));
    expect(pill.textContent).toContain("Default (5 min)");
    flushSync(() => pill.click());
    const offered = choices(host);
    expect(offered.map(([label]) => label)).toEqual(expect.arrayContaining(["Default (5 min)", "30 minutes"]));
    expect(offered.filter(([, chosen]) => chosen).map(([label]) => label)).toEqual(["Default (5 min)"]);
  });

  it("selects a saved 30 minute limit on that conversation only", () => {
    const { host, pill } = mount(room([
      { threadId: "launch", title: "Launch", createdAt: 1, turnTimeoutMinutes: 30 },
      { threadId: "other", title: "Other", createdAt: 2 },
    ]));
    expect(pill.textContent).toContain("30 minutes");
    flushSync(() => pill.click());
    const offered = choices(host);
    expect(offered.filter(([, chosen]) => chosen).map(([label]) => label)).toEqual(["30 minutes"]);
  });
});
