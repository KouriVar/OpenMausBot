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

/** The fork's black Bloub avatar: its light theme gradient runs #585858 → #000000, so the accent every
 * surface takes is #2c2c2c. A neutral reports a numerical hue of ~90°, and the yellow family's window
 * used to catch it, painting a pale grey bubble with dark words. */
describe("a neutral black keeps a black fill with white words", () => {
  it("reads #2c2c2c as a dark fill, not as a pale yellow-family one", () => {
    const style = userBubbleStyleHex("#2c2c2c", { flat: false }) as Record<string, string>;
    expect(style["--color-bubble-user"]).toBe("#2c2c2c");
    expect(style["--color-bubble-user-ink"].toLowerCase()).toBe("#ffffff");
    expect(contrastRatio(style["--color-bubble-user-ink"], style["--color-bubble-user"])).toBeGreaterThanOrEqual(BUBBLE_TEXT_MIN);
  });

  it("leaves the yellow family and the pale greys on dark words", () => {
    for (const hex of ["#f09b1c", "#e18c0e", "#888888"]) {
      expect((userBubbleStyleHex(hex) as Record<string, string>)["--color-bubble-user-ink"].toLowerCase()).toBe("#101410");
    }
  });
});
