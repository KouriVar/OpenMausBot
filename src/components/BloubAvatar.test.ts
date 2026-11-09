import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BloubAvatar, bloubState } from "./BloubAvatar";

const render = (props: Parameters<typeof BloubAvatar>[0]) =>
  renderToStaticMarkup(createElement(BloubAvatar, props));

describe("BloubAvatar", () => {
  it("maps the app's bot states onto Bloub's own", () => {
    expect(bloubState("idle")).toBe("idle");
    expect(bloubState("thinking")).toBe("thinking");
    expect(bloubState("working")).toBe("thinking");
    expect(bloubState("loading")).toBe("thinking");
    expect(bloubState("alerting")).toBe("alert");
    expect(bloubState("surprised")).toBe("wide");
    expect(bloubState("happy")).toBe("wink");
    expect(bloubState("success")).toBe("wink");
    expect(bloubState("proud")).toBe("wink");
    expect(bloubState("celebrate")).toBe("burst");
    expect(bloubState("sleeping")).toBe("sleep");
    expect(bloubState("spawning")).toBe("swirl");
    expect(bloubState("searching")).toBe("idle");
    expect(bloubState(undefined)).toBe("idle");
  });

  it("draws one masked body in the bot's colour, with a frame per state", () => {
    const idle = render({ size: 44, colorId: "vert", state: "idle", animated: false });
    expect(idle).toContain("<svg");
    expect(idle).toContain("<clipPath");
    expect(idle).toContain("#3ecf8e");
    expect(idle).toContain("role=\"img\"");
    const alert = render({ size: 44, colorId: "vert", state: "alerting", animated: false });
    expect(alert).not.toBe(idle);
  });

  it("draws Bloub's own shapes and faces, not the mascot's", () => {
    const circle = render({ size: 64, shape: "cercle", colorId: "violet", expression: "neutre", frozenAt: 1 });
    const cloud = render({ size: 64, shape: "nuage", colorId: "violet", expression: "neutre", frozenAt: 1 });
    expect(circle).not.toBe(cloud);
    const calm = render({ size: 64, shape: "cercle", colorId: "violet", expression: "neutre", frozenAt: 1 });
    const angry = render({ size: 64, shape: "cercle", colorId: "violet", expression: "colere", frozenAt: 1 });
    expect(calm).not.toBe(angry);
  });

  it("is reproducible at a frozen instant", () => {
    const at = (frozenAt: number) => render({ size: 64, colorId: "rose", state: "thinking", frozenAt });
    expect(at(1.2)).toBe(at(1.2));
    expect(at(1.2)).not.toBe(at(2.4));
  });
});
