// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyInsetLayout, readInsetLayout, setInsetLayout } from "./inset-layout";

const store = new Map<string, string>();
const memory = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
};

beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", memory);
});

afterEach(() => {
  store.clear();
  document.documentElement.removeAttribute("data-inset-layout");
});

describe("the app's layout", () => {
  it("is Classic until the person picks Inset, and is kept on this computer", () => {
    expect(readInsetLayout()).toBe("classic");
    setInsetLayout("inset");
    expect(readInsetLayout()).toBe("inset");
    setInsetLayout("classic");
    expect(readInsetLayout()).toBe("classic");
  });

  it("puts the layout on the document, where the card's styles read it", () => {
    applyInsetLayout("inset");
    expect(document.documentElement.getAttribute("data-inset-layout")).toBe("inset");
    applyInsetLayout("classic");
    expect(document.documentElement.getAttribute("data-inset-layout")).toBe("classic");
  });
});
