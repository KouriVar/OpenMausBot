import { describe, expect, it } from "vitest";

import { cappedApprovalMode, SIMULAR_ALWAYS_ASK_TOOLS, SIMULAR_BOX_URL, simularAlwaysAsks } from "../shared/simular.ts";
import { simularConnected, simularServerConfigured } from "./simular.ts";
import type { AppConfig } from "./config.ts";

const server = (over: Record<string, unknown> = {}) => ({ type: "http", url: "https://mcp.box.simular.ai/mcp", headers: {}, enabled: true, ...over });
const cfgWith = (mcpServers: Record<string, unknown> | undefined): AppConfig => ({ mcpServers } as unknown as AppConfig);
const oauth = (state: "signed-in" | "needs-sign-in" | "none") => ({ authState: () => state });

describe("the person's Simular Box", () => {
  it("is used only when its own entry is there, on, reached by URL and signed in", () => {
    expect(simularServerConfigured(cfgWith({ simular: server() }))).toBe(true);
    expect(simularServerConfigured(cfgWith({ simular: server({ enabled: false }) }))).toBe(false);
    expect(simularServerConfigured(cfgWith({ simular: server({ type: "stdio", command: "npx" }) }))).toBe(false);
    expect(simularServerConfigured(cfgWith({ other: server() }))).toBe(false);
    expect(simularServerConfigured(cfgWith(undefined))).toBe(false);

    expect(simularConnected(cfgWith({ simular: server() }), oauth("signed-in"))).toBe(true);
    // A sign-in that has expired asks the person to sign in again; the panel says so instead of calling the box.
    expect(simularConnected(cfgWith({ simular: server() }), oauth("needs-sign-in"))).toBe(false);
    expect(simularConnected(cfgWith({ simular: server() }), oauth("none"))).toBe(false);
    // A turned-off entry is not a connection, whatever sign-in it kept.
    expect(simularConnected(cfgWith({ simular: server({ enabled: false }) }), oauth("signed-in"))).toBe(false);
  });

  it("keeps its own two tools out of every automatic answer, and only those", () => {
    expect([...SIMULAR_ALWAYS_ASK_TOOLS]).toEqual(["mcp__simular__shell", "mcp__simular__box_delete"]);
    for (const tool of SIMULAR_ALWAYS_ASK_TOOLS) expect(simularAlwaysAsks(tool)).toBe(true);
    expect(simularAlwaysAsks(" mcp__simular__shell ")).toBe(true);
    // This app's own cloud computer, another server's namesake, and the box's other tools stay as they were.
    expect(simularAlwaysAsks("mcp__computer__exec")).toBe(false);
    expect(simularAlwaysAsks("mcp__other__shell")).toBe(false);
    expect(simularAlwaysAsks("mcp__simular__screenshot")).toBe(false);
    expect(simularAlwaysAsks(undefined)).toBe(false);
    expect(simularAlwaysAsks(42)).toBe(false);
  });

  it("caps Full access at Approve for me, so the engine never answers those two by itself", () => {
    expect(cappedApprovalMode("full", "simular")).toBe("auto");
    expect(cappedApprovalMode("ask", "simular")).toBe("ask");
    expect(cappedApprovalMode("auto", "simular")).toBe("auto");
    // Every other computer keeps the level the person granted.
    expect(cappedApprovalMode("full", "box")).toBe("full");
    expect(cappedApprovalMode("full", "vps")).toBe("full");
    expect(cappedApprovalMode("full", undefined)).toBe("full");
  });

  it("watches and is taken over at the box's own portal", () => {
    expect(SIMULAR_BOX_URL).toBe("https://box.simular.ai/box");
  });
});
