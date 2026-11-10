import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { MentionText } from "./MentionText";
import { bloubReadableColor } from "./BloubIdentity";
import { defaultBloubSkin } from "@/fork/bloub-skin";

const exp = (color: string) => bloubReadableColor(defaultBloubSkin(color).color, "dark");

it("uses each bot's avatar colour and updates when its color changes", () => {
  for (const color of ["red", "blue"] as const) {
    const html = renderToStaticMarkup(createElement(MentionText, {
      text: "@Atlas @Juniper @everyone", everyone: true,
      peers: [{ name: "Atlas", color, botId: "a1" }, { name: "Juniper", color: "purple", botId: "a2" }],
    }));
    expect(html).toContain(`style="--mention-color:${exp(color)}"`);
    expect(html).toContain(">@Atlas<");
    expect(html).toContain('class="mention-chip-face"'); // small static face inside the chip
    expect(html).toContain(">@everyone<");
  }
});

it("decorates known names while preserving whitespace and escaping text", () => {
  const html = renderToStaticMarkup(createElement(MentionText, {
    text: "<script>\n@Atlas & @Ghost\n@Atlas", peers: [{ name: "Atlas", botId: "a1" }],
  }));
  expect(html).toContain("&lt;script&gt;\n");
  expect(html.match(/>@Atlas</g)).toHaveLength(2);
  expect(html).toContain(" &amp; @Ghost\n");
});

it("leaves a mention plain when its peer is hidden or gone", () => {
  for (const peers of [[{ name: "Renamed" }], [{ name: "Atlas", hidden: true }]]) {
    expect(renderToStaticMarkup(createElement(MentionText, { text: "@Atlas", peers }))).toBe("@Atlas");
  }
});
