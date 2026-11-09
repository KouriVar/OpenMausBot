import { describe, expect, it } from "vitest";

import { BLOUB_MIN_BLOCK, stateSwitchDelay } from "./bloub-session";

describe("a state switch waits for Bloub's block", () => {
  it("switches at once once the running block has had its morph", () => {
    expect(stateSwitchDelay(10.0, 9.0)).toBe(0);
    expect(stateSwitchDelay(10.0, 10.0 - BLOUB_MIN_BLOCK)).toBe(0);
  });

  it("waits out the rest of MIN_BLOCK when it arrives early", () => {
    expect(stateSwitchDelay(10.1, 10.0)).toBeCloseTo(0.5, 5);
    expect(stateSwitchDelay(10.59, 10.0)).toBeCloseTo(0.01, 5);
  });
});
