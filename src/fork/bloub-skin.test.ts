import { beforeEach, describe, expect, it, vi } from "vitest";

import { BLOUB_SKIN_PREFIX, defaultBloubSkin, loadBloubSkin, parseBloubSkin, saveBloubSkin } from "./bloub-skin";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
});

describe("a bot's OMB colour on Bloub's palette", () => {
  it("maps every colour the app uses", () => {
    expect(defaultBloubSkin("green").color).toBe("vert");
    expect(defaultBloubSkin("teal").color).toBe("turquoise");
    expect(defaultBloubSkin("cyan").color).toBe("turquoise");
    expect(defaultBloubSkin("blue").color).toBe("bleu");
    expect(defaultBloubSkin("purple").color).toBe("violet");
    expect(defaultBloubSkin("pink").color).toBe("rose");
    expect(defaultBloubSkin("coral").color).toBe("rose");
    expect(defaultBloubSkin("red").color).toBe("rouge");
    expect(defaultBloubSkin("orange").color).toBe("orange");
    expect(defaultBloubSkin("yellow").color).toBe("ambre");
    expect(defaultBloubSkin("silver").color).toBe("gris");
    expect(defaultBloubSkin("chrome").color).toBe("gris");
  });

  it("rests a new bot on a circle with a still face", () => {
    expect(defaultBloubSkin("green")).toEqual({ shape: "cercle", color: "vert", expression: "neutre" });
    expect(defaultBloubSkin(undefined).color).toBe("encre");
  });
});

describe("a stored look read back", () => {
  const fallback = defaultBloubSkin("blue");

  it("keeps a value it recognises", () => {
    const raw = JSON.stringify({ shape: "nuage", color: "rouge", expression: "fier" });
    expect(parseBloubSkin(raw, fallback)).toEqual({ shape: "nuage", color: "rouge", expression: "fier" });
  });

  it("falls back per field, not all at once", () => {
    const raw = JSON.stringify({ shape: "hexagone", color: "chartreuse", expression: "inconnu" });
    expect(parseBloubSkin(raw, fallback)).toEqual({ shape: "hexagone", color: "bleu", expression: "neutre" });
  });

  it("survives junk and absence", () => {
    expect(parseBloubSkin(null, fallback)).toEqual(fallback);
    expect(parseBloubSkin("", fallback)).toEqual(fallback);
    expect(parseBloubSkin("{not json", fallback)).toEqual(fallback);
    expect(parseBloubSkin("42", fallback)).toEqual(fallback);
    expect(parseBloubSkin('"x"', fallback)).toEqual(fallback);
  });
});

describe("keeping a look", () => {
  it("round-trips through the browser's storage", () => {
    saveBloubSkin("bot-1", { shape: "goutte", color: "violet", expression: "timide" });
    expect(store.get(BLOUB_SKIN_PREFIX + "bot-1")).toBeTruthy();
    expect(loadBloubSkin("bot-1", "green")).toEqual({ shape: "goutte", color: "violet", expression: "timide" });
  });

  it("gives a bot with no id, or nothing stored, the colour's default", () => {
    expect(loadBloubSkin(undefined, "yellow")).toEqual({ shape: "cercle", color: "ambre", expression: "neutre" });
    expect(loadBloubSkin("never-saved", "red")).toEqual({ shape: "cercle", color: "rouge", expression: "neutre" });
  });
});
