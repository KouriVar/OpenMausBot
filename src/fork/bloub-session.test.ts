import { describe, expect, it } from "vitest";

import type { Bot, Message } from "@/state/store";
import { bloubSessionState } from "./bloub-session";

const bot = (patch: Partial<Bot> = {}) => ({ id: "b", threadId: "t", name: "B", color: "green", unread: false, ...patch }) as unknown as Bot;
const said = (patch: Record<string, unknown>) => ({ id: "m1", role: "bot", kind: "text", text: "", at: 1000, ...patch }) as unknown as Message;
const NOW = 1_000_000;

describe("a bot's turn on Bloub's states", () => {
  it("asks with alert, dies with exclaim", () => {
    expect(bloubSessionState(bot({ activity: "waiting-on-you" }), [], NOW)).toBe("alert");
    expect(bloubSessionState(bot({ activity: "dead" }), [], NOW)).toBe("exclaim");
    expect(bloubSessionState(bot({ busy: true }), [said({ kind: "activity", tool: { name: "x", ok: false } })], NOW)).toBe("exclaim");
  });

  it("thinks before a tool, orbits while one runs", () => {
    expect(bloubSessionState(bot({ busy: true }), [said({ at: NOW - 100 })], NOW)).toBe("thinking");
    const running = said({ kind: "activity", tool: { name: "shell", ok: true }, at: NOW - 100 });
    expect(bloubSessionState(bot({ busy: true }), [running], NOW)).toBe("orbit");
    const done = said({ kind: "activity", tool: { name: "shell", ok: true }, dataResult: { ok: true }, at: NOW - 100 });
    expect(bloubSessionState(bot({ busy: true }), [done], NOW)).toBe("thinking");
  });

  it("notifies unread, sleeps long idle, else idles", () => {
    expect(bloubSessionState(bot({ unread: true }), [said({ at: NOW - 100 })], NOW)).toBe("notify");
    expect(bloubSessionState(bot({ activity: "idle" }), [said({ at: NOW - 11 * 60_000 })], NOW)).toBe("sleep");
    expect(bloubSessionState(bot(), [said({ at: NOW - 11 * 60_000 })], NOW)).toBe("idle");
    expect(bloubSessionState(bot(), [said({ at: NOW - 1000 })], NOW)).toBe("idle");
    expect(bloubSessionState(bot(), [], NOW)).toBe("idle");
  });
});
