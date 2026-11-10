// @vitest-environment happy-dom
// The group stack in a real DOM: the caller's faces, the ones the tail counts, and the surface disc that
// cuts each face out of the one beneath it.
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GroupFaceCluster, GroupFaceStack } from "./GroupFaceStack";

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

function cluster(props: Parameters<typeof GroupFaceCluster>[0]) {
  flushSync(() => root.render(createElement(GroupFaceCluster, props)));
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

describe("a group's square cluster", () => {
  it("puts two members corner to corner and never counts the rest", () => {
    cluster({ faces: ["a", "b"].map(face), layout: "pair", size: 32, surface: "var(--color-panel)" });
    const drawn = [...host.querySelectorAll<HTMLElement>("[data-group-face]")];
    expect(drawn).toHaveLength(2);
    expect(host.querySelector("[data-group-faces-shape]")?.getAttribute("data-group-faces-shape")).toBe("pair");
    expect(host.querySelector("[data-group-face-more]")).toBeNull();
    // Upper left, then lower right by the same step: 60% of the square, 40% left over.
    expect(drawn[0]!.style.left).toBe("0px");
    expect(drawn[0]!.style.top).toBe("0px");
    expect(drawn[1]!.style.left).toBe(drawn[1]!.style.top);
    expect(Number.parseFloat(drawn[1]!.style.left)).toBeGreaterThan(0);
    expect(Number(drawn[0]!.style.zIndex)).toBeGreaterThan(Number(drawn[1]!.style.zIndex));
  });

  it("stands three or more as a pyramid: one centred on top, two below", () => {
    cluster({ faces: ["a", "b", "c", "d"].map(face), layout: "triad", size: 48, surface: "var(--color-app)" });
    const drawn = [...host.querySelectorAll<HTMLElement>("[data-group-face]")];
    expect(drawn).toHaveLength(3);
    const box = (el: HTMLElement) => ({
      left: Number.parseFloat(el.style.left),
      top: Number.parseFloat(el.style.top),
      side: Number.parseFloat(el.style.width),
    });
    const [top, left, right] = drawn.map(box);
    expect(top!.top).toBe(0);
    expect(top!.left).toBeGreaterThan(0);
    expect(top!.left).toBeLessThan(top!.side);
    expect(left!.left).toBe(0);
    expect(right!.left).toBeGreaterThan(left!.left);
    expect(left!.top).toBe(right!.top);
    expect(left!.top).toBeGreaterThan(0);
  });

  it("sits each face on a disc the colour of the row behind it", () => {
    cluster({ faces: ["a", "b"].map(face), layout: "pair", size: 36, surface: "var(--color-raised)" });
    for (const el of host.querySelectorAll<HTMLElement>("[data-group-face]")) {
      expect(el.style.background).toContain("--color-raised");
      expect(el.style.boxShadow).toContain("--color-raised");
    }
  });
});
