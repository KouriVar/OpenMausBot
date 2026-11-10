// @vitest-environment happy-dom
// The group stack in a real DOM: the caller's faces, the ones the tail counts, and the surface disc that
// cuts each face out of the one beneath it.
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GroupFaceStack } from "./GroupFaceStack";

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  flushSync(() => root.unmount());
  host.remove();
});

const face = (name: string) => createElement("span", { key: name, "data-fixture-face": name }, name);

function render(props: Parameters<typeof GroupFaceStack>[0]) {
  flushSync(() => root.render(createElement(GroupFaceStack, props)));
}

describe("a group's faces", () => {
  it("draws only the faces it was given and counts the rest in one tail", () => {
    render({ face: 24, surface: "var(--color-app)", total: 5, faces: ["a", "b", "c"].map(face) });
    expect(host.querySelectorAll("[data-group-face]")).toHaveLength(3);
    expect(host.querySelectorAll("[data-group-face-more]")).toHaveLength(1);
    expect(host.querySelector("[data-group-face-more]")?.textContent).toBe("+2");
  });

  it("says nothing about a count when every member is drawn", () => {
    render({ face: 24, surface: "var(--color-app)", total: 2, faces: ["a", "b"].map(face) });
    expect(host.querySelectorAll("[data-group-face]")).toHaveLength(2);
    expect(host.querySelector("[data-group-face-more]")).toBeNull();
  });

  it("rides each face over the one before it on a disc the colour of the surface behind", () => {
    render({ face: 24, surface: "var(--color-panel)", total: 2, faces: ["a", "b"].map(face) });
    const [first, second] = [...host.querySelectorAll<HTMLElement>("[data-group-face]")];
    expect(first?.style.background).toContain("--color-panel");
    expect(first?.style.boxShadow).toContain("--color-panel");
    expect(first?.style.marginLeft).toBe("");
    // The second face starts under the first, and the first paints above it.
    expect(Number.parseFloat(second!.style.marginLeft)).toBeLessThan(0);
    expect(Number(first!.style.zIndex)).toBeGreaterThan(Number(second!.style.zIndex));
  });
});
