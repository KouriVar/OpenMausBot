// @vitest-environment happy-dom
// The changes a reply applied on its own — skills, automations, memory, a profile — fold into that reply's bubble as one
// chip, whatever kind they are and even when there is only one.
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AppState, Bot, InstanceInfo, Message, OptionCardData } from "@/state/store";

vi.mock("./DesktopCapabilities", async (importOriginal) => ({
  ...await importOriginal<typeof import("./DesktopCapabilities")>(),
  useDesktopCapabilities: () => ({ capabilities: { dictation: { available: false }, host: { packaged: true, platform: "other" }, localComputer: { available: false } }, ready: true }),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/lib/cloud-guest", () => ({ useCanWriteIn: () => true, useReactor: () => "user" }));
vi.mock("./ModelPicker", () => ({ ModelPicker: () => null }));

const { ChatView } = await import("./ChatView");
const { BotEditorStore, initialState } = await import("@/state/store");
const { t } = await import("@/lib/i18n");

const at = (minute: number) => new Date(2026, 9, 21, 9, minute).getTime();
const applied = (id: string, card: Partial<OptionCardData>): Message => ({
  id, parentId: "m2", role: "bot", kind: "options", at: at(3),
  card: { title: "Applied", subtitle: "", options: [], answered: "allow", autoApplied: true, requestId: id, ...card },
});
const skill = (id: string, name: string) => applied(id, {
  tool: "stage_skill",
  skillRequest: { version: 1, requestId: id, botId: "pepper", threadId: "main", stagedId: `staged-${id}`, action: "create", name, gist: "", warnings: [], createdAt: 1 } as never,
});
const routine = (id: string, name: string, action: "create" | "update" = "update") => applied(id, {
  tool: "manage_routine",
  routineRequest: {
    version: 1, requestId: id, botId: "pepper", threadId: "main", createdAt: 1,
    operation: { action, routine: { name } },
    ...(action === "create" ? { resultId: "routine-1" } : {}),
    undo: { name, before: {}, appliedUpdatedAt: at(4) },
  } as never,
});
const profile = (id: string) => applied(id, {
  tool: "update_profile",
  profileRequest: { version: 1, requestId: id, botId: "pepper", targetBotId: "pepper", changes: { name: "Pepper" } } as never,
});
/** The branch the transcript draws is its leaf's path, so each message's parent is the one before it. */
const onPath = (tail: Message[]): Message[] => tail.map((message, index) => ({ ...message, parentId: index === 0 ? "m2" : tail[index - 1]!.id }));
const transcript = (tail: Message[]): Message[] => [
  { id: "m1", parentId: null, role: "user", kind: "text", text: "Set it up.", at: at(1) },
  { id: "m2", parentId: "m1", role: "bot", kind: "text", text: "Done.", at: at(2), turnId: "t1", turnTerminal: true },
  ...tail,
];
const pepper = (messages: Message[]): Bot => ({
  id: "pepper", threadId: "main", name: "Pepper", title: "", description: "", color: "green",
  notifications: true, unread: false, busy: false, messages, activeLeafId: messages.at(-1)!.id, modelSelection: { instanceId: "test", model: "m" },
  tasks: [{ threadId: "main", title: "Chat", createdAt: 1, busy: false, activity: "idle", modelSelection: { instanceId: "test", model: "m" }, approvalMode: "ask" }],
});

const dispatch = vi.fn();
let root: Root;
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
async function draw(messages: Message[]) {
  flushSync(() => root.render(null));
  const bot = pepper(messages);
  const state: AppState = {
    ...initialState, connected: true, selectedId: "pepper", bots: [bot], routinesLoadState: "ready",
    instances: [{ instanceId: "test", driverKind: "codex", displayName: "Test", snapshot: { state: "available" } } as InstanceInfo],
  };
  const value = { state, dispatch, flushBotPatches: async () => null, refreshInstances: async () => {}, refreshModels: async () => {} };
  flushSync(() => root.render(createElement(BotEditorStore, { value, children: createElement(ChatView, { bot }) })));
  await settle();
}
const chip = () => document.querySelector<HTMLElement>("[data-auto-applied-changes]");
const chipTitle = () => chip()?.querySelector("button")?.textContent ?? null;
const appliedRows = () => [...document.querySelectorAll<HTMLElement>("[data-applied-change]")];
const openChip = async () => {
  flushSync(() => chip()!.querySelector<HTMLButtonElement>("button")!.click());
  await settle();
};

beforeAll(() => {
  vi.stubGlobal("fetch", () => new Promise(() => {}));
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterAll(() => {
  root.unmount();
  vi.unstubAllGlobals();
});

describe("the changes a reply applied on its own", () => {
  it("folds a single skill into the reply's bubble, which opens to the same row with Undo and Details", async () => {
    await draw(transcript(onPath([skill("s1", "rough-cut")])));
    expect(chipTitle()).toBe(t("chat.learnedSkills.title"));
    // Folded: the row is not in the transcript's own columns.
    expect(appliedRows()).toHaveLength(0);
    await openChip();
    expect(appliedRows()).toHaveLength(1);
    expect(appliedRows()[0]!.textContent).toContain("rough-cut");
    expect([...appliedRows()[0]!.querySelectorAll("button")].map((button) => button.textContent)).toEqual(
      expect.arrayContaining([t("approval.applied.undo"), t("approval.applied.details")]),
    );
  });

  it("folds a single automation change, naming what it updated", async () => {
    await draw(transcript(onPath([routine("r1", "Inbox brief")])));
    expect(chipTitle()).toBe(t("chat.autoApplied.automation.one"));
    expect(appliedRows()).toHaveLength(0);
    await openChip();
    expect(appliedRows()).toHaveLength(1);
    expect(appliedRows()[0]!.textContent).toContain("Inbox brief");
  });

  it("counts a mixed run: a skill and an automation land as two changes", async () => {
    await draw(transcript(onPath([skill("s1", "rough-cut"), routine("r1", "Inbox brief")])));
    expect(chipTitle()).toBe(t("chat.autoApplied.title.many", { count: 2 }));
    expect(appliedRows()).toHaveLength(0);
    await openChip();
    expect(appliedRows()).toHaveLength(2);
  });

  it("leaves an automation the reply made as its own card, which carries the plan and Undo", async () => {
    await draw(transcript(onPath([routine("r2", "Inbox brief", "create")])));
    expect(chip()).toBeNull();
    expect(document.querySelectorAll("[data-trigger-card]")).toHaveLength(1);
  });

  it("names a single change of any other kind by its count", async () => {
    await draw(transcript(onPath([profile("p1")])));
    expect(chipTitle()).toBe(t("chat.autoApplied.title.one", { count: 1 }));
    await openChip();
    expect(appliedRows()).toHaveLength(1);
  });
});
