import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { MAUS_COLOR_NAMES } from "@/lib/mascot";
import { MentionText } from "./MentionText";
import { ChatMarkdown } from "./ChatMarkdown";
import { bloubReadableColor } from "./BloubIdentity";
import { defaultBloubSkin } from "@/fork/bloub-skin";

it.each(["plain text", "Markdown"] as const)("keeps all bot colours independent (with faces) in %s", (renderer) => {
  for (const color of MAUS_COLOR_NAMES) {
    const name = `Bot ${color}`;
    const peers = [{ name, color, botId: `bot-${color}` }];
    const html = renderToStaticMarkup(renderer === "plain text"
      ? createElement(MentionText, { text: `@${name} ordinary @Unknown`, peers })
      : createElement(ChatMarkdown, { text: `@${name} ordinary @Unknown`, mentionPeers: peers }));
    const expected = bloubReadableColor(defaultBloubSkin(color).color, "dark");
    expect(html).toContain("mention-chip");
    expect(html).toContain(`style="--mention-color:${expected}"`);
    expect(html).toContain(`>@${name}<`);
    expect(html).toContain('class="mention-chip-face"');
    expect(html).toContain("@Unknown"); // unmatched stays plain text
  }
});
