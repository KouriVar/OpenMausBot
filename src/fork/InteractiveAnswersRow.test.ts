// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({ config: {} as Record<string, unknown>, dispatch: vi.fn() }));
vi.mock("@/state/store", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/state/store")>();
  return { ...original, useStore: () => ({ state: { ...original.initialState, config: store.config }, dispatch: store.dispatch }) };
});

import { setLocale } from "@/lib/i18n";
import { InteractiveAnswersRow } from "./InteractiveAnswersRow";

let container: HTMLDivElement;
let root: Root;
const bodies: string[] = [];

const draw = () => act(() => root.render(createElement(InteractiveAnswersRow)));
const radios = () => [...container.querySelectorAll<HTMLButtonElement>('button[role="radio"]')];
const checked = () => radios().map((radio) => radio.getAttribute("aria-checked"));

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("fetch", vi.fn(async (_path: string, init?: RequestInit) => {
    bodies.push(String(init?.body));
    return new Response(JSON.stringify({ features: { interactiveAnswers: "off" } }), { status: 200, headers: { "content-type": "application/json" } });
  }));
  setLocale("en");
  bodies.length = 0;
  store.config = {};
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("interactive answers", () => {
  it("offers off, components and components with HTML, and checks the one the config holds", () => {
    for (const [mode, expected] of [
      ["off", ["true", "false", "false"]],
      ["widgets", ["false", "true", "false"]],
      ["widgets+html", ["false", "false", "true"]],
    ] as const) {
      store.config = { features: { interactiveAnswers: mode } };
      draw();
      expect(radios().map((radio) => radio.textContent), mode).toEqual(["Off", "Components", "Components + HTML"]);
      expect(checked(), mode).toEqual(expected);
    }
  });

  it("reads a config without the setting as components", () => {
    store.config = {};
    draw();
    expect(checked()).toEqual(["false", "true", "false"]);
  });

  it("saves off with a PATCH of features.interactiveAnswers and hands the answer to the store", async () => {
    store.config = { features: { interactiveAnswers: "widgets+html" } };
    draw();
    await act(async () => radios()[0]!.click());
    expect(bodies).toEqual(['{"features":{"interactiveAnswers":"off"}}']);
    expect(store.dispatch).toHaveBeenCalledWith({ type: "configStatus", config: { features: { interactiveAnswers: "off" } } });
  });
});
