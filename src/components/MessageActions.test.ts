import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MessageActions, type MessageMenuItem } from "./MessageActions";

type Props = Parameters<typeof MessageActions>[0];

const pin: MessageMenuItem = { key: "pin", icon: null, label: "Pin message", onSelect: () => {} };

const render = (props: Partial<Omit<Props, "children">> = {}) =>
  renderToStaticMarkup(
    createElement(MessageActions, {
      side: "bot",
      ...props,
      children: [
        createElement("button", { type: "button", key: "reply" }, "reply"),
        createElement("button", { type: "button", key: "copy" }, "copy"),
      ],
    }),
  );

describe("MessageActions", () => {
  // Fork: the bubble shows no hover buttons at all; its right-click menu carries reply, copy and the rest.
  it("draws no hover row, and keeps the actions in the right-click menu", () => {
    const html = render({ menu: [pin] });
    expect(html).not.toContain(">reply<");
    expect(html).not.toContain('aria-haspopup="menu"');
    expect(html).not.toContain("Pin message");
  });

  it("stays out while a control must remain reachable", () => {
    const html = render({ forceOpen: true });
    expect(html).toContain('data-shown="true"');
    expect(html).not.toContain("opacity-0");
  });

  it("draws nothing of its own for either side, so the bubble alone decides where it sits", () => {
    expect(render({ side: "user" })).toContain("contents");
    expect(render({ side: "bot" })).toContain("contents");
  });
});
