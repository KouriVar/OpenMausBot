// The person's Simular Box, reached through the MCP server they added in Settings → Plugins. Nothing here creates or
// deletes a machine: one Simular account has one box, and it wakes by itself when the server is used.
//
// Two callers: the Screen panel's still (a still every few seconds while the person watches, never on its own), and the
// box's sleep from the panel. A turn's own calls go through the turn's mounted MCP server, which carries the same sign-in.

import { RemoteMcpClient, MAX_REMOTE_MCP_BYTES, remoteMcpSpec } from "./mcp-http.ts";
import { parseStoredMcpServer } from "./mcp-registry.ts";
import { withMcpSignIn, type McpOAuthManager } from "./mcp-oauth.ts";
import type { AppConfig } from "./config.ts";
import type { McpServerSpec } from "./contracts.ts";
import {
  SIMULAR_CLIENT_NAME, SIMULAR_HIBERNATE_TOOL, SIMULAR_SCREENSHOT_TOOL, SIMULAR_SERVER, SIMULAR_STATUS_TOOL, SIMULAR_WAKE_TOOL,
} from "../shared/simular.ts";

/** How long one panel call may take: a still is one screen, but a box that went to sleep needs waking first, and the
 * first call after a restart also pays for its sign-in. */
export const SIMULAR_CALL_MS = 45_000;

/** One still of the box's screen, as the panel's image takes it. */
export interface SimularFrame {
  png: string;
  format: string;
}

/** A box only answers while its server is configured, turned on and signed in; anything else is "not connected here". */
export function simularServerConfigured(cfg: AppConfig): boolean {
  const raw = cfg.mcpServers?.[SIMULAR_SERVER];
  if (raw === undefined) return false;
  const parsed = parseStoredMcpServer(SIMULAR_SERVER, raw);
  if (!parsed.ok || !parsed.server.enabled) return false;
  return remoteMcpSpec(parsed.server) !== undefined;
}

/** Whether the person's box can be used here: its server is configured and its sign-in is kept. */
export function simularConnected(cfg: AppConfig, mcpOAuth: Pick<McpOAuthManager, "authState">): boolean {
  if (!simularServerConfigured(cfg)) return false;
  const raw = cfg.mcpServers?.[SIMULAR_SERVER];
  const parsed = raw === undefined ? null : parseStoredMcpServer(SIMULAR_SERVER, raw);
  const spec = parsed?.ok ? remoteMcpSpec(parsed.server) : undefined;
  return spec !== undefined && mcpOAuth.authState(SIMULAR_SERVER, spec.url) === "signed-in";
}

/** The entry with this installation's sign-in attached, or null when the box is not connected here. */
async function simularSpec(cfg: AppConfig, mcpOAuth: McpOAuthManager): Promise<ReturnType<typeof remoteMcpSpec> | null> {
  const raw = cfg.mcpServers?.[SIMULAR_SERVER];
  if (raw === undefined) return null;
  const parsed = parseStoredMcpServer(SIMULAR_SERVER, raw);
  if (!parsed.ok || !parsed.server.enabled) return null;
  if (!remoteMcpSpec(parsed.server)) return null;
  const signedIn = await withMcpSignIn({ [SIMULAR_SERVER]: parsed.server }, mcpOAuth);
  return remoteMcpSpec(signedIn[SIMULAR_SERVER]) ?? null;
}

/** One tool call on the box, through a short-lived MCP session; null when it is not connected here. */
export async function simularCall(
  cfg: AppConfig,
  mcpOAuth: McpOAuthManager,
  tool: string,
  args: Record<string, unknown>,
  signal: AbortSignal,
): Promise<unknown | null> {
  const spec = await simularSpec(cfg, mcpOAuth);
  if (!spec) return null;
  const client = new RemoteMcpClient(spec, { maxBytes: MAX_REMOTE_MCP_BYTES });
  try {
    await client.initialize(SIMULAR_CLIENT_NAME, signal);
    return await client.request("tools/call", { name: tool, arguments: args }, signal);
  } finally {
    await client.close().catch(() => {});
  }
}

function imageOf(result: unknown): SimularFrame | null {
  const content = result && typeof result === "object" ? (result as { content?: unknown }).content : undefined;
  if (!Array.isArray(content)) return null;
  for (const item of content) {
    if (!item || typeof item !== "object") continue;
    const { type, data, mimeType } = item as { type?: unknown; data?: unknown; mimeType?: unknown };
    if (type !== "image" || typeof data !== "string" || !data) continue;
    const mime = typeof mimeType === "string" ? mimeType.toLowerCase() : "image/png";
    return { png: data, format: mime.includes("jpeg") || mime.includes("jpg") ? "jpeg" : "png" };
  }
  return null;
}

/** One still of the box's screen. A call the server could not answer is not a frame, so the panel shows its own error. */
export async function simularScreenshot(cfg: AppConfig, mcpOAuth: McpOAuthManager, signal: AbortSignal): Promise<SimularFrame> {
  const result = await simularCall(cfg, mcpOAuth, SIMULAR_SCREENSHOT_TOOL, {}, signal);
  if (result === null) throw Object.assign(new Error("Simular Box is not connected in Settings → Plugins"), { status: 409 });
  if ((result as { isError?: unknown })?.isError === true) {
    const content = (result as { content?: unknown }).content;
    const text = Array.isArray(content) ? content.map((item) => (item as { text?: unknown })?.text).filter((item): item is string => typeof item === "string").join(" ") : "";
    throw Object.assign(new Error(text.trim() || "Simular Box could not take a screenshot"), { status: 502 });
  }
  const frame = imageOf(result);
  if (!frame) throw Object.assign(new Error("Simular Box answered without a screenshot"), { status: 502 });
  return frame;
}

/** What the box last said about itself: `state` when it names one, else null. Reads nothing and wakes nothing. */
export async function simularStatus(cfg: AppConfig, mcpOAuth: McpOAuthManager, signal: AbortSignal): Promise<{ state: string | null }> {
  const result = await simularCall(cfg, mcpOAuth, SIMULAR_STATUS_TOOL, {}, signal);
  if (result === null) return { state: null };
  const content = result && typeof result === "object" ? (result as { content?: unknown }).content : undefined;
  if (!Array.isArray(content)) return { state: null };
  for (const item of content) {
    const text = item && typeof item === "object" ? (item as { text?: unknown }).text : undefined;
    if (typeof text !== "string") continue;
    try {
      const parsed = JSON.parse(text) as { state?: unknown; status?: unknown };
      const state = typeof parsed.state === "string" ? parsed.state : typeof parsed.status === "string" ? parsed.status : null;
      if (state) return { state };
    } catch {
      const word = /\b(idle|running|asleep|hibernat\w*|awake|starting|stopped)\b/i.exec(text);
      if (word) return { state: word[1]!.toLowerCase() };
    }
  }
  return { state: null };
}

/** Put the box to sleep now, so it stops costing its owner hours. */
export async function simularSleep(cfg: AppConfig, mcpOAuth: McpOAuthManager, signal: AbortSignal): Promise<boolean> {
  const result = await simularCall(cfg, mcpOAuth, SIMULAR_HIBERNATE_TOOL, {}, signal);
  return result !== null && (result as { isError?: unknown })?.isError !== true;
}

/** Wake the box without waiting for the next tool call. */
export async function simularWake(cfg: AppConfig, mcpOAuth: McpOAuthManager, signal: AbortSignal): Promise<boolean> {
  const result = await simularCall(cfg, mcpOAuth, SIMULAR_WAKE_TOOL, {}, signal);
  return result !== null && (result as { isError?: unknown })?.isError !== true;
}

/** The box's MCP server, signed in, as a turn mounts it: the bot's tools are its own, so nothing here narrows them. */
export async function simularTurnMount(cfg: AppConfig, mcpOAuth: McpOAuthManager): Promise<Record<string, McpServerSpec> | null> {
  const spec = await simularSpec(cfg, mcpOAuth);
  return spec ? { [SIMULAR_SERVER]: spec as McpServerSpec } : null;
}
