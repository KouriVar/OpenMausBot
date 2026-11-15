// A Google A2UI 1.0 surface stored on a bot row: the wire messages the agent
// validated, and the data model the person has filled in. Shared by the
// server that parses the reply, the wire type and the chat that draws it.

/** The v1.0 basic catalog, extended here with Table: both the prompt and the chat
 * resolve components by this id. */
export const A2UI_CATALOG_ID = "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json";

/** Fenced block in the reply text that marks where a surface is drawn. Its body is
 * the index in `surfaces`. */
export const A2UI_FENCE_TAG = "a2ui";

/** A reply block that did not validate, kept as plain text where the surface would have been. */
export const A2UI_RAW_FENCE_TAG = "a2ui-raw";

type SurfaceMessage = { surfaceId?: unknown };

export type A2uiWireMessage = Record<string, unknown> & {
  version?: string;
  createSurface?: SurfaceMessage & Record<string, unknown>;
  updateComponents?: SurfaceMessage & Record<string, unknown>;
  updateDataModel?: SurfaceMessage & Record<string, unknown>;
  deleteSurface?: SurfaceMessage & Record<string, unknown>;
};

export interface A2uiSurfaceRecord {
  /** `messageId:index`, unique across every surface in the conversation. */
  id: string;
  /** The messages that build this surface, in order. */
  messages: A2uiWireMessage[];
  /** The data model as last saved, filled values included. */
  dataModel: Record<string, unknown>;
}

export interface A2uiPayload {
  v: 1;
  surfaces: A2uiSurfaceRecord[];
}

/** The fence whose body is a surface index. */
export function a2uiFence(index: number): string {
  return `\`\`\`${A2UI_FENCE_TAG}\n${index}\n\`\`\``;
}

export function a2uiRawFence(raw: string): string {
  const fence = raw.includes("~~~") || raw.includes("```") ? "````" : "~~~";
  return `${fence}${A2UI_RAW_FENCE_TAG}\n${raw.trim()}\n${fence}`;
}

/** The index a fence body names, when it names exactly one. */
export function a2uiFenceIndex(body: string): number | undefined {
  const value = body.trim();
  if (!/^\d{1,3}$/.test(value)) return undefined;
  return Number(value);
}

export function isA2uiWireMessage(value: unknown): value is A2uiWireMessage {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const message = value as A2uiWireMessage;
  return Boolean(message.createSurface || message.updateComponents || message.updateDataModel || message.deleteSurface);
}

export function a2uiSurfaceId(message: A2uiWireMessage): string | undefined {
  const entry = message.createSurface ?? message.updateComponents ?? message.updateDataModel ?? message.deleteSurface;
  return typeof entry?.surfaceId === "string" ? entry.surfaceId : undefined;
}

/** What a later turn reads where the reply drew a surface: the fence names an index
 * only the chat can resolve. */
export function a2uiTranscriptText(text: string): string {
  return text.replace(/```a2ui\n\d{1,3}\n```/g, "[an interactive component you showed]");
}
