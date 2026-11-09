import { describe, expect, it } from "vitest";

import { contrastRatio } from "./color-contrast";
import { COLORS } from "@/vendor/bloub/skins";
import { BUBBLE_TEXT_MIN, userBubbleStyleHex } from "./user-bubble-tone";

/** Every Bloub colour, light or dark, keeps the person's words readable on their own bubble. */
describe("a Bloub-coloured bubble keeps its text readable", () => {
  it.each(COLORS.map((colour) => [colour.id, colour.hex] as const))("%s", (_id, hex) => {
    const style = userBubbleStyleHex(hex, { flat: false }) as Record<string, string>;
    expect(contrastRatio(style["--color-bubble-user-ink"], style["--color-bubble-user"])).toBeGreaterThanOrEqual(BUBBLE_TEXT_MIN);
  });

  it("reads white on dark inks and near-black on pale ones", () => {
    const ink = (hex: string) => (userBubbleStyleHex(hex) as Record<string, string>)["--color-bubble-user-ink"].toLowerCase();
    expect(ink("#0a0a0c")).toBe("#ffffff");
    expect(["#101410", "#ffffff"]).toContain(ink("#f1efe9"));
  });
});
