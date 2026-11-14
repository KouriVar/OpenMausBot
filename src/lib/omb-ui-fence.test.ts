import { describe, expect, it } from "vitest";

import { isOmbUiFence, parseOmbUiFence } from "./omb-ui-fence";

describe("a reply's omb-ui fence", () => {
  it("is the fence whose info string is omb-ui, in any case", () => {
    expect(isOmbUiFence("omb-ui")).toBe(true);
    expect(isOmbUiFence(" OMB-UI ")).toBe(true);
    expect(isOmbUiFence("json")).toBe(false);
    expect(isOmbUiFence("omb-ui-wrap")).toBe(false);
    expect(isOmbUiFence("")).toBe(false);
  });

  it("parses a body into the widget tree it holds", () => {
    const fence = parseOmbUiFence('\n  {"type":"Card","title":"Plan","children":[{"type":"Text","value":"Inline"}]}\n');
    expect(fence.ok).toBe(true);
    if (!fence.ok) return;
    expect(fence.root).toMatchObject({ type: "Card", title: "Plan" });
    expect(fence.root.children?.[0]).toMatchObject({ type: "Text", value: "Inline" });
  });

  it("gives the parser's error for a body that is not JSON", () => {
    expect(parseOmbUiFence("{not json")).toEqual({ ok: false, error: "widget: must be a JSON object, not text." });
    expect(parseOmbUiFence("")).toEqual({ ok: false, error: "widget: must be a JSON object, not text." });
  });

  it("gives the parser's error for a node type nothing renders", () => {
    const fence = parseOmbUiFence('{"type":"Card","children":[{"type":"Marquee","value":"hi"}]}');
    expect(fence.ok).toBe(false);
    if (fence.ok) return;
    expect(fence.error).toContain('unknown type "Marquee"');
  });

  it("gives the parser's error for a tree past the node limit", () => {
    const children = Array.from({ length: 251 }, () => ({ type: "Text", value: "one line" }));
    const fence = parseOmbUiFence(JSON.stringify({ type: "Card", children }));
    expect(fence.ok).toBe(false);
    if (fence.ok) return;
    expect(fence.error).toContain("more than 250 nodes");
  });
});
