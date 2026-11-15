// A person's edits to a stored A2UI surface: the values it keeps and the
// action a button sends back to the bot.
import type { A2uiPayload } from "../../shared/a2ui.ts";
import type { Message } from "../store.ts";

const MODEL_LIMIT = 64_000;
const CONTEXT_LIMIT = 20_000;

type Store = { messagesFor(threadId: string): Message[]; patchMessage(threadId: string, messageId: string, patch: Partial<Message>): Message | null };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

function surfaceOf(message: Message | undefined, surfaceId: unknown): A2uiPayload | undefined {
  if (!message || message.kind !== "text" || !message.a2ui || typeof surfaceId !== "string") return undefined;
  return message.a2ui.surfaces.some((surface) => surface.id === surfaceId) ? message.a2ui : undefined;
}

export type A2uiModelSave =
  | { ok: true; messageId: string; payload: A2uiPayload }
  | { ok: false; status: 400 | 404; error: string };

export function prepareA2uiModel(store: Store, threadId: string, raw: unknown): A2uiModelSave {
  if (!isRecord(raw)) return { ok: false, status: 400, error: "a2uiModel must be {messageId, surfaceId, dataModel}" };
  const { messageId, surfaceId, dataModel } = raw;
  if (typeof messageId !== "string" || !/^[\w-]+$/.test(messageId) || typeof surfaceId !== "string" || !isRecord(dataModel)) {
    return { ok: false, status: 400, error: "a2uiModel must be {messageId, surfaceId, dataModel}" };
  }
  if (JSON.stringify(dataModel).length > MODEL_LIMIT) return { ok: false, status: 400, error: "a2uiModel is too large" };
  const message = store.messagesFor(threadId).find((candidate) => candidate.id === messageId);
  const payload = surfaceOf(message, surfaceId);
  if (!message || !payload) return { ok: false, status: 404, error: "That component is not in this conversation." };
  return {
    ok: true,
    messageId,
    payload: { ...payload, surfaces: payload.surfaces.map((surface) => (surface.id === surfaceId ? { ...surface, dataModel } : surface)) },
  };
}

export type A2uiActionRequest =
  | { ok: true; messageId: string; surfaceId: string; name: string; context: Record<string, unknown> }
  | { ok: false; status: 400 | 404; error: string };

export function prepareA2uiAction(store: Store, threadId: string, raw: unknown): A2uiActionRequest {
  if (!isRecord(raw)) return { ok: false, status: 400, error: "a2uiAction must be {messageId, surfaceId, name, context?}" };
  const { messageId, surfaceId, name, context } = raw;
  if (typeof messageId !== "string" || !/^[\w-]+$/.test(messageId) || typeof surfaceId !== "string" ||
      typeof name !== "string" || !name.trim() || name.length > 200 ||
      (context !== undefined && context !== null && !isRecord(context))) {
    return { ok: false, status: 400, error: "a2uiAction must be {messageId, surfaceId, name, context?}" };
  }
  if (context && JSON.stringify(context).length > CONTEXT_LIMIT) return { ok: false, status: 400, error: "a2uiAction is too large" };
  const message = store.messagesFor(threadId).find((candidate) => candidate.id === messageId);
  if (!surfaceOf(message, surfaceId)) return { ok: false, status: 404, error: "That component is not in this conversation." };
  return { ok: true, messageId, surfaceId, name: name.trim(), context: (context as Record<string, unknown> | undefined) ?? {} };
}
