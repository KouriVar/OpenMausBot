// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";

import { readAdvancedMode, setAdvancedMode } from "@/lib/interface-mode";

import { readAdvancedUnlocked, setAdvancedUnlocked } from "./advanced-unlock";

/** This test environment ships no web storage, and both modules read the window's. */
function storageStub(): Storage {
  const map = new Map<string, string>();
  const stub = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, String(value)),
    removeItem: (key: string) => void map.delete(key),
    clear: () => map.clear(),
    key: (index: number) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
  Object.defineProperty(globalThis, "localStorage", { value: stub, configurable: true });
  Object.defineProperty(window, "localStorage", { value: stub, configurable: true });
  return stub;
}

let store: Storage;
beforeEach(() => {
  store = storageStub();
});

describe("the hidden Advanced unlock", () => {
  it("keeps Advanced off until the icon is tapped open", () => {
    expect(readAdvancedMode()).toBe(false);
    setAdvancedUnlocked(true);
    // Unlocked, but nobody picked Advanced: a browser that never chose starts Simple.
    expect(readAdvancedMode()).toBe(false);
    setAdvancedMode(true);
    expect(readAdvancedMode()).toBe(true);
  });

  it("hides the switch again once Advanced is turned off", () => {
    setAdvancedUnlocked(true);
    setAdvancedMode(true);
    expect(readAdvancedUnlocked()).toBe(true);
    setAdvancedMode(false);
    setAdvancedUnlocked(false);
    expect(readAdvancedUnlocked()).toBe(false);
    expect(readAdvancedMode()).toBe(false);
  });

  it("remembers the choice on this device", () => {
    setAdvancedUnlocked(true);
    setAdvancedMode(true);
    expect(store.getItem("omb-advanced-unlocked")).toBe("1");
    expect(store.getItem("omb-advanced-mode")).toBe("1");
    expect(readAdvancedMode()).toBe(true);
  });
});

describe("the Advanced switch's visibility", () => {
  it("only renders once the unlock is on", async () => {
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { AdvancedModeRow } = await import("@/components/AppSettingsRows");
    expect(renderToStaticMarkup(createElement(AdvancedModeRow))).toBe("");
    setAdvancedUnlocked(true);
    expect(renderToStaticMarkup(createElement(AdvancedModeRow))).toContain('role="switch"');
  });
});
