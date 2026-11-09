import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BLOUB_SKIN_PREFIX,
  GROK_COLORS,
  bloubColorChoices,
  bloubColorHex,
  bloubEyeColor,
  bloubEyeMode,
  bloubGradient,
  bloubMid,
  bloubSolid,
  bloubSwatch,
  defaultBloubSkin,
  loadBloubSkin,
  normalizeBloubColor,
  parseBloubSkin,
  saveBloubSkin,
} from "./bloub-skin";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  });
});

describe("a bot's OMB colour on the Grok palette", () => {
  it("maps every colour the app uses to a new id", () => {
    expect(defaultBloubSkin("green").color).toBe("green");
    expect(defaultBloubSkin("teal").color).toBe("cyan");
    expect(defaultBloubSkin("cyan").color).toBe("cyan");
    expect(defaultBloubSkin("blue").color).toBe("blue");
    expect(defaultBloubSkin("purple").color).toBe("violet");
    expect(defaultBloubSkin("pink").color).toBe("magenta");
    expect(defaultBloubSkin("coral").color).toBe("magenta");
    expect(defaultBloubSkin("red").color).toBe("red");
    expect(defaultBloubSkin("orange").color).toBe("orange");
    expect(defaultBloubSkin("yellow").color).toBe("yellow");
    expect(defaultBloubSkin("silver").color).toBe("gray");
    expect(defaultBloubSkin("chrome").color).toBe("gray");
    expect(defaultBloubSkin("chartreuse").color).toBe("black");
  });

  it("rests a new bot on a blob with a still face", () => {
    expect(defaultBloubSkin("green")).toEqual({ shape: "blob", color: "green", expression: "neutre" });
    expect(defaultBloubSkin(undefined).color).toBe("black");
  });
});

describe("a stored look read back", () => {
  const fallback = defaultBloubSkin("blue");

  it("keeps a value it recognises and normalises an old colour id", () => {
    const raw = JSON.stringify({ shape: "nuage", color: "rouge", expression: "fier" });
    expect(parseBloubSkin(raw, fallback)).toEqual({ shape: "nuage", color: "red", expression: "fier" });
  });

  it("falls back per field, not all at once", () => {
    const raw = JSON.stringify({ shape: "hexagone", color: "chartreuse", expression: "inconnu" });
    expect(parseBloubSkin(raw, fallback)).toEqual({ shape: "hexagone", color: "blue", expression: "neutre" });
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
    expect(loadBloubSkin(undefined, "yellow")).toEqual({ shape: "blob", color: "yellow", expression: "neutre" });
    expect(loadBloubSkin("never-saved", "red")).toEqual({ shape: "blob", color: "red", expression: "neutre" });
  });
});

describe("the Grok colour table", () => {
  it("has the 11 measured colours in order", () => {
    expect(GROK_COLORS.map((c) => c.id)).toEqual([
      "black", "brown", "red", "orange", "yellow", "green", "cyan", "blue", "violet", "magenta", "gray",
    ]);
    expect(GROK_COLORS).toHaveLength(11);
    expect(GROK_COLORS[0]).toEqual({ id: "black", solid: "#000000", light: ["#585858", "#000000"], dark: ["#FFFFFF", "#C2C2C2"] });
    expect(GROK_COLORS[5]).toEqual({ id: "green", solid: "#00C972", light: ["#1CCF82", "#009957"], dark: ["#00C972", "#008048"] });
  });

  it("folds legacy ids onto the new ones", () => {
    expect(normalizeBloubColor("encre")).toBe("black");
    expect(normalizeBloubColor("creme")).toBe("black");
    expect(normalizeBloubColor("vert")).toBe("green");
    expect(normalizeBloubColor("ambre")).toBe("yellow");
    expect(normalizeBloubColor("gris")).toBe("gray");
    expect(normalizeBloubColor("green")).toBe("green");
    expect(normalizeBloubColor("wat")).toBe("black");
  });

  it("reads a scheme gradient and its midpoint", () => {
    expect(bloubGradient("green", "dark")).toEqual({ from: "#00C972", to: "#008048" });
    expect(bloubGradient("vert", "light")).toEqual({ from: "#1CCF82", to: "#009957" });
    expect(bloubMid("green", "dark")).toMatch(/^#[0-9a-f]{6}$/);
    expect(bloubSwatch("green", "dark")).toBe("linear-gradient(135deg, #00C972, #008048)");
  });

  it("gives a pure solid, inverting black for the dark scheme", () => {
    expect(bloubSolid("black", "dark")).toBe("#FFFFFF");
    expect(bloubSolid("black", "light")).toBe("#000000");
    expect(bloubSolid("vert")).toBe("#00C972");
  });

  it("lists 11 swatches for Grok, first black", () => {
    const choices = bloubColorChoices("grok");
    expect(choices).toHaveLength(11);
    expect(choices[0]).toEqual({ id: "black", hex: "#000000" });
    expect(bloubColorChoices("bloub")).toHaveLength(12);
  });
});

describe("hexes and eyes across the two palettes", () => {
  it("keeps Bloub's own table and shows the Grok solid", () => {
    expect(bloubColorHex("vert", "bloub")).toBe("#3ecf8e");
    expect(bloubColorHex("vert", "grok")).toBe("#00C972");
    expect(bloubColorHex("encre", "grok")).toBe("#000000");
    expect(bloubColorHex("creme", "grok")).toBe("#000000");
  });

  it("cuts the eyes out on Grok and paints them for Bloub", () => {
    expect(bloubEyeMode("grok")).toBe("cutout");
    expect(bloubEyeMode("bloub")).toBe("paper");
    expect(bloubEyeColor("grok")).toBeNull();
    expect(bloubEyeColor("bloub")).toBeNull();
  });
});
