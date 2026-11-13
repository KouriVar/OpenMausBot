// The Chief's mark is a display choice kept on this computer: one value per bot, the crown unless the person picked the
// department lead's flag. It never touches the bot's chiefOfStaff, so a lead walks the same feature.
import { beforeEach, describe, expect, it, vi } from "vitest";

import { chiefStyleOf, setChiefStyle } from "./chief-style";

const memory = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  };
};

beforeEach(() => {
  vi.stubGlobal("localStorage", memory());
  vi.stubGlobal("window", Object.assign(new EventTarget(), { dispatchEvent: (event: Event) => EventTarget.prototype.dispatchEvent.call(globalThis.window, event) }));
});

describe("a bot's Chief mark", () => {
  it("is the crown until the person picks the flag, and only for that bot", () => {
    expect(chiefStyleOf("atlas")).toBe("crown");
    setChiefStyle("atlas", "lead");
    expect(chiefStyleOf("atlas")).toBe("lead");
    expect(chiefStyleOf("bea")).toBe("crown");
  });

  it("keeps one mark at a time: picking the crown drops the flag", () => {
    setChiefStyle("atlas", "lead");
    setChiefStyle("atlas", "crown");
    expect(chiefStyleOf("atlas")).toBe("crown");
    const stored = JSON.parse(globalThis.localStorage.getItem("omb.fork.chiefStyle") ?? "{}");
    expect(stored).toEqual({});
  });

  it("ignores a stored value it does not know", () => {
    globalThis.localStorage.setItem("omb.fork.chiefStyle", JSON.stringify({ atlas: "sceptre", bea: "lead" }));
    expect(chiefStyleOf("atlas")).toBe("crown");
    expect(chiefStyleOf("bea")).toBe("lead");
  });
});
