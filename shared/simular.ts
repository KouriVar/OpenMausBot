// A Simular Box is another company's cloud desktop, reached through its own MCP server instead of through this app's
// computer tools. One account has one box: it sleeps when nobody uses it and wakes when the MCP server connects, so
// nothing here creates or deletes a machine behind a person's back.
//
// Kept in one place because four layers name it: the wire type, the turn that mounts its tools, the panel that shows
// its screen, and the approval rules that keep two of its tools from ever running on their own.

/** The configured MCP server a box is reached through, by its name in Settings → Plugins. */
export const SIMULAR_SERVER = "simular";

/** The portal where a person watches the box live and takes control of it. */
export const SIMULAR_BOX_URL = "https://box.simular.ai/box";

/** The address its server card publishes, for a person adding it by hand. */
export const SIMULAR_MCP_URL = "https://mcp.box.simular.ai/mcp";

/** The client name the app introduces itself with over MCP. */
export const SIMULAR_CLIENT_NAME = "OpenMausBot";

/** The checkbox's own tools the app calls outside a turn: a still of the screen, and the box's sleep. */
export const SIMULAR_SCREENSHOT_TOOL = "screenshot";
export const SIMULAR_STATUS_TOOL = "box_status";
export const SIMULAR_WAKE_TOOL = "box_wake";
export const SIMULAR_HIBERNATE_TOOL = "box_hibernate";

/** A shell on someone else's computer, and deleting that computer: neither ever runs without a person's own yes, at any
 * approval level, because Full access is a grant to this app and not to another company's machine. Matched on the whole
 * name: a bare "shell" would also catch this app's own cloud computer.
 */
export const SIMULAR_ALWAYS_ASK_TOOLS = [`mcp__${SIMULAR_SERVER}__shell`, `mcp__${SIMULAR_SERVER}__box_delete`] as const;
const ALWAYS_ASK: ReadonlySet<string> = new Set(SIMULAR_ALWAYS_ASK_TOOLS);

export function simularAlwaysAsks(tool: unknown): boolean {
  return typeof tool === "string" && ALWAYS_ASK.has(tool.trim());
}

/** The highest approval level a Simular Box turn may run at: "full" would hand the engine its own bypass and the two
 * tools above would never reach a person. */
export function simularApprovalCeiling(backend: string | null | undefined): "auto" | null {
  return backend === "simular" ? "auto" : null;
}

export function isSimularBackend(backend: string | null | undefined): boolean {
  return backend === "simular";
}
