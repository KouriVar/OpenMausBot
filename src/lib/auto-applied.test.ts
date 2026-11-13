import { describe, expect, it } from "vitest";
import type { Message, OptionCardData } from "@/state/store";
import type { TranscriptItem } from "./activity-runs";
import { autoAppliedKind, autoAppliedTitle, foldAutoAppliedChanges, isAutoAppliedChange } from "./auto-applied";

const card = (extra: Partial<OptionCardData> = {}): OptionCardData => ({
  title: "Applied",
  subtitle: "",
  options: [],
  autoApplied: true,
  answered: "allow",
  ...extra,
});
const change = (id: string, extra: Partial<OptionCardData> = {}): Message => ({ id, role: "bot", kind: "options", at: 1, card: card(extra) });
const line = (id: string, role: "bot" | "user", text: string): Message => ({ id, role, kind: "text", text, at: 1 });
const skill = (id: string) => change(id, { skillRequest: {} as never });
const automation = (id: string) => change(id, { routineRequest: { operation: { action: "update" } } as never });
const madeAutomation = (id: string) => change(id, { routineRequest: { operation: { action: "create" }, resultId: "routine-1" } as never });
const profile = (id: string) => change(id, { profileRequest: {} as never });
const items = (...messages: Message[]): TranscriptItem[] => messages.map((message) => ({ kind: "message", message }));

describe("a change a reply applied on its own", () => {
  it("is any card that applied, whatever it changed — not only skills", () => {
    expect(isAutoAppliedChange(skill("s"))).toBe(true);
    expect(isAutoAppliedChange(automation("a"))).toBe(true);
    expect(isAutoAppliedChange(profile("p"))).toBe(true);
  });

  it("leaves out an answer that had to be given, a held one and a plain card", () => {
    expect(isAutoAppliedChange(change("open", { autoApplied: undefined }))).toBe(false);
    expect(isAutoAppliedChange(change("asked", { answered: "deny" }))).toBe(false);
    expect(isAutoAppliedChange(change("held", { held: "Could not apply it." }))).toBe(false);
    expect(isAutoAppliedChange({ id: "t", role: "bot", kind: "text", text: "Hi", at: 1 })).toBe(false);
  });

  it("leaves an automation it made as its own card, which carries the plan and Undo", () => {
    expect(isAutoAppliedChange(madeAutomation("a1"))).toBe(false);
  });
});

describe("what a change touched", () => {
  it("names skills, every kind of automation, and everything else", () => {
    expect(autoAppliedKind(card({ skillRequest: {} as never }))).toBe("skill");
    expect(autoAppliedKind(card({ routineRequest: {} as never }))).toBe("automation");
    expect(autoAppliedKind(card({ webhookRequest: {} as never }))).toBe("automation");
    expect(autoAppliedKind(card({ appTriggerRequest: {} as never }))).toBe("automation");
    expect(autoAppliedKind(card({ profileRequest: {} as never }))).toBe("other");
    expect(autoAppliedKind(card({ modelRequest: {} as never }))).toBe("other");
    expect(autoAppliedKind(card({ teamMemoryRequest: { section: "s", entryId: "e", kind: "memory" } }))).toBe("other");
  });
});

describe("the chip's title", () => {
  it("names skills alone, however many", () => {
    expect(autoAppliedTitle(["skill"])).toEqual({ key: "chat.learnedSkills.title" });
    expect(autoAppliedTitle(["skill", "skill"])).toEqual({ key: "chat.learnedSkills.title" });
  });

  it("names automations alone, one or many", () => {
    expect(autoAppliedTitle(["automation"])).toEqual({ key: "chat.autoApplied.automation.one" });
    expect(autoAppliedTitle(["automation", "automation"])).toEqual({ key: "chat.autoApplied.automation.many" });
  });

  it("counts a mixed run, and a run of anything else", () => {
    expect(autoAppliedTitle(["skill", "automation"])).toEqual({ key: "chat.autoApplied.title.many", params: { count: 2 } });
    expect(autoAppliedTitle(["automation", "other"])).toEqual({ key: "chat.autoApplied.title.many", params: { count: 2 } });
    expect(autoAppliedTitle(["other"])).toEqual({ key: "chat.autoApplied.title.one", params: { count: 1 } });
    expect(autoAppliedTitle(["skill", "automation", "other"])).toEqual({ key: "chat.autoApplied.title.many", params: { count: 3 } });
  });
});

describe("folding a run into its reply", () => {
  it("takes a single change too, and every kind with it", () => {
    const folded = foldAutoAppliedChanges(items(line("reply", "bot", "Done."), automation("a1")));
    expect([...folded.consumed]).toEqual(["a1"]);
    expect(folded.hosts.get("reply")!.map((message) => message.id)).toEqual(["a1"]);
  });

  it("keeps a mixed run together on the reply above it", () => {
    const folded = foldAutoAppliedChanges(items(line("reply", "bot", "Done."), skill("s1"), automation("a1"), profile("p1")));
    expect([...folded.consumed]).toEqual(["s1", "a1", "p1"]);
    expect(folded.hosts.get("reply")!.map((message) => message.id)).toEqual(["s1", "a1", "p1"]);
  });

  it("does not cross a new turn, and gives each reply its own run", () => {
    const folded = foldAutoAppliedChanges(items(
      line("u1", "user", "Do it."),
      line("r1", "bot", "First."),
      skill("s1"),
      line("u2", "user", "Again."),
      automation("a1"),
      line("r2", "bot", "Second."),
      skill("s2"),
    ));
    // a1 came after a user message and before any reply: it has no bubble to fold into.
    expect([...folded.consumed]).toEqual(["s1", "s2"]);
    expect(folded.hosts.get("r1")!.map((message) => message.id)).toEqual(["s1"]);
    expect(folded.hosts.get("r2")!.map((message) => message.id)).toEqual(["s2"]);
  });

  it("keeps a run on the reply above a turn's tool rows", () => {
    const folded = foldAutoAppliedChanges([
      { kind: "message", message: line("r1", "bot", "Working on it.") },
      { kind: "run", id: "run-1", messages: [line("t1", "bot", "tool")] },
      { kind: "message", message: skill("s1") },
    ]);
    expect(folded.hosts.get("r1")!.map((message) => message.id)).toEqual(["s1"]);
  });
});
