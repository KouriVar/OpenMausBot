// A bot's cloud desktop can be the person's own Simular Box. Everything on the server that names it lives here, so the
// main server only decides when to call in: which provider a turn runs on, the box's own MCP tools instead of this app's
// computer tools, the panel's still and portal, and the words a turned-away call gets.

import { SIMULAR_BOX_URL } from "../shared/simular.ts";
import { attachCustomMcp } from "./mcp-result-budget.ts";
import { resolveComputerPromptKind, type ComputerPromptKind } from "./system-prompt.ts";
import { simularConnected, simularScreenshot, simularSleep, simularTurnMount } from "./simular.ts";
import type { AppConfig } from "./config.ts";
import type { SendTurnInput } from "./contracts.ts";
import type { McpOAuthManager } from "./mcp-oauth.ts";

export const SIMULAR_NOT_CONNECTED = "Simular Box is not connected in Settings → Plugins";

export interface SimularReply {
  status: number;
  body: unknown;
}

type Integrations = NonNullable<SendTurnInput["integrations"]>;

/** Which cloud provider this turn runs on: a team's shared computer and `runOn: "cloud"` are always this app's own. */
export function cloudBackendForTurn(input: {
  teamComputer: unknown;
  runOnCloud: boolean;
  backend: "box" | "vps" | "simular" | undefined;
}): "box" | "vps" | "simular" {
  if (input.teamComputer || input.runOnCloud) return "box";
  if (input.backend === "vps") return "vps";
  return input.backend === "simular" ? "simular" : "box";
}

/** The system prompt paragraph for the computer this turn has: the box has its own, every other computer its own. */
export function computerPromptKindFor(
  input: { cloudBackend: "box" | "vps" | "simular"; kind: "box" | "vps" | "vm" | "local" | null; vmPrivate: boolean },
): ComputerPromptKind | null {
  if (input.cloudBackend === "simular" && input.kind === "box") return "simular";
  return resolveComputerPromptKind({ kind: input.kind, vmPrivate: input.vmPrivate });
}

/** GET /api/bots/:id/computer for a bot whose cloud desktop is the person's box: its sign-in is the whole status. */
export function simularComputerStatus(cfg: AppConfig, oauth: Pick<McpOAuthManager, "authState">) {
  const connected = simularConnected(cfg, oauth);
  return { surface: "cloud" as const, backend: "simular" as const, configured: connected, simular: { connected } };
}

/** One of the panel's verbs on the box. Only a still touches it; the portal is where a person watches and drives, and
 * this app never creates, replaces or deletes another company's desktop. */
export async function simularComputerVerb(input: {
  cfg: AppConfig;
  oauth: McpOAuthManager;
  verb: string;
  botId: string;
  signal: AbortSignal;
  /** One capture per computer at a time, shared with everyone watching it. */
  previews: { capture<T>(computer: string, shoot: () => Promise<T>): Promise<T> };
  noStore(): void;
}): Promise<SimularReply> {
  if (!simularConnected(input.cfg, input.oauth)) return { status: 409, body: { error: SIMULAR_NOT_CONNECTED } };
  switch (input.verb) {
    case "screenshot":
      input.noStore();
      return { status: 200, body: await input.previews.capture(input.botId, () => simularScreenshot(input.cfg, input.oauth, input.signal)) };
    case "join":
      return { status: 200, body: { joinUrl: SIMULAR_BOX_URL } };
    case "sleep":
      return { status: 200, body: { slept: await simularSleep(input.cfg, input.oauth, input.signal) } };
    case "provision":
      return { status: 409, body: { error: "A Simular account has one desktop already; there is nothing to create here." } };
    case "remove":
      return { status: 409, body: { error: "This app creates no desktop at Simular; remove the server in Settings → Plugins." } };
    default:
      return { status: 409, body: { error: "The bot runs commands there with the box's own shell tool" } };
  }
}

/** The turn's tools: the box's own MCP server, signed in, and none of this app's computer tools. False when the person's
 * server cannot be reached, so the caller can word the refusal. */
export async function mountSimularBox(input: {
  cfg: AppConfig;
  oauth: McpOAuthManager;
  botId: string;
  threadId: string;
  integrations: Integrations;
}): Promise<boolean> {
  const mount = await simularTurnMount(input.cfg, input.oauth);
  if (!mount) return false;
  // Wrapped on its own, then merged: the bot's own servers are already brokered and must not be wrapped twice.
  const wrapped: Pick<Integrations, "custom" | "customResultBudgets"> = {};
  attachCustomMcp(wrapped, mount, input.cfg, { botId: input.botId, threadId: input.threadId });
  input.integrations.custom = { ...input.integrations.custom, ...wrapped.custom };
  if (wrapped.customResultBudgets) input.integrations.customResultBudgets = { ...input.integrations.customResultBudgets, ...wrapped.customResultBudgets };
  return true;
}
