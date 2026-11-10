import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import en from "@/locales/en.json";

const fixture = vi.hoisted(() => ({ config: null as unknown }));
vi.mock("@/state/store", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/state/store")>();
  return { ...original, useStore: () => ({ state: { ...original.initialState, config: fixture.config }, dispatch: vi.fn() }) };
});

const { updateMcpServers } = await import("@/lib/mcp-servers");
const { CloudBackendPicker } = await import("./CloudBackendPicker");
const picker = (value: "box" | "vps" | "simular" = "box") => renderToStaticMarkup(createElement(CloudBackendPicker, { value, onChange: () => {} }));

describe("CloudBackendPicker", () => {
  afterEach(() => { fixture.config = null; });

  it("offers Boat or a self-hosted VPS on a desktop or self-hosted server", () => {
    fixture.config = { cloudHome: false };
    expect(picker()).toContain("Self-hosted VPS");
  });

  it("is hidden on My Cloud", () => {
    fixture.config = { cloudHome: true };
    expect(picker()).toBe("");
  });

  it.each(["box", "simular", "vps"] as const)("offers every backend whichever is chosen (%s)", (value) => {
    const markup = picker(value);
    expect(markup).toContain("Boat");
    expect(markup).toContain("Self-hosted VPS");
    expect(markup).not.toMatch(/ACP model provider/);
  });

  it("offers Simular Box only once its own server is connected and signed in, and says where until then", () => {
    // Nothing connected: the choice is there, cannot be picked, and the line says where to connect it.
    expect(picker()).toContain("Not connected yet");
    expect(picker()).toMatch(/<button[^>]*disabled[^>]*>Simular Box<\/button>/);

    updateMcpServers([{ name: "simular", enabled: true, auth: "signed-in" }]);
    try {
      const ready = picker();
      expect(ready).not.toContain("Not connected yet");
      expect(ready).not.toMatch(/<button[^>]*disabled[^>]*>Simular Box<\/button>/);
      // A sign-in that has expired is not a connection.
      updateMcpServers([{ name: "simular", enabled: true, auth: "needs-sign-in" }]);
      expect(picker()).toContain("Not connected yet");
      updateMcpServers([{ name: "simular", enabled: false, auth: "signed-in" }]);
      expect(picker()).toContain("Not connected yet");
    } finally {
      updateMcpServers([]);
    }
  });

  it("leaves no message that tells someone to switch backends for an engine", () => {
    expect(Object.keys(en)).not.toContain("computer.err.vpsEngine");
    expect(Object.values(en).filter((value) => /switch the cloud backend to Boat/i.test(value))).toEqual([]);
  });
});
