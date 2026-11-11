// @vitest-environment happy-dom
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatBusyContext, MessageActions, type MessageMenuItem } from "./MessageActions";

const items: MessageMenuItem[] = [
  { key: "edit", icon: null, label: "Edit", onSelect() {}, idleOnly: true },
  { key: "id", icon: null, label: "Copy id", onSelect() {} },
];

describe("a chat message's menu while a turn runs", () => {
  let root: Root, host: HTMLElement;
  const draw = (busy: boolean) => flushSync(() => root.render(
    createElement(ChatBusyContext, { value: busy },
      createElement("div", { "data-message-row": "" }, createElement(MessageActions, { side: "user", menu: items }))),
  ));
  const offered = () => [...host.querySelectorAll("[role=menuitem]")].map((item) => item.textContent);
  beforeEach(() => {
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  });
  afterEach(() => {
    flushSync(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  });

  it("leaves out what only works between turns, and offers it again when the turn ends", () => {
    // Fork: no more button — the menu opens on a right-click of the message row.
    vi.stubGlobal("getComputedStyle", () => ({ direction: "ltr" }));
    // Fork: no more button — the menu opens on a right-click of the message row.
    const open = () => flushSync(() => host.querySelector("[data-message-row]")!
      .dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 20, clientY: 20 })));
    draw(true);
    open();
    expect(offered()).toEqual(["Copy id"]);
    draw(false);
    expect(offered()).toEqual(["Edit", "Copy id"]);
    draw(true);
    expect(offered()).toEqual(["Copy id"]);
  });
});
