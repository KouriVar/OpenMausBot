// Google A2UI 1.0 for bot replies: one catalog shared by the prompt the model
// reads and the validation of what it writes back.
import { A2uiGenerator, CatalogConfig, DirectJsonFormatFactory, FunctionPruningTransformer, InMemoryCatalogProvider, type A2uiRequestProcessor } from "@a2ui/agent";
// Vendored from @a2ui/web_core 0.15.0 (Apache-2.0, see third_party/a2ui) with
// the Table component this fork adds.
import catalogDocument from "./basic-catalog.json" with { type: "json" };
import { showsComponentFences, type InteractiveAnswerMode } from "../../shared/interactive-answers.ts";
import type { A2uiOutputMode } from "../../shared/a2ui.ts";
import {
  A2UI_CATALOG_ID, a2uiFence, a2uiRawFence, a2uiSurfaceId,
  type A2uiSurfaceRecord, type A2uiWireMessage,
} from "../../shared/a2ui.ts";

export { A2UI_CATALOG_ID };

const BLOCK = /<(a2ui|a2ui-json)>([\s\S]*?)<\/\1\s*>/g;

let generator: A2uiGenerator | undefined;
const processors = new Map<"express" | "json", A2uiRequestProcessor>();

function sharedGenerator(): A2uiGenerator {
  if (!generator) {
    const document = catalogDocument as unknown as Record<string, unknown>;
    const catalog = new InMemoryCatalogProvider(document, "1.0", A2UI_CATALOG_ID).load();
    // openUrl opens a page from a component; this chat leaves links to the words people can read.
    const functions = Array.from(catalog.functions.values()).map((entry) => entry.name).filter((name) => name !== "openUrl");
    generator = new A2uiGenerator([new CatalogConfig(catalog, [new FunctionPruningTransformer(functions)])]);
  }
  return generator;
}

/** Chat scope: each response is checked against its own empty state. */
function replyProcessor(kind: "express" | "json" = "express"): A2uiRequestProcessor {
  let processor = processors.get(kind);
  if (!processor) {
    const capabilities = { "1.0": { supportedCatalogIds: [A2UI_CATALOG_ID] } };
    processor = kind === "json"
      ? sharedGenerator().createProcessor(capabilities, new DirectJsonFormatFactory())
      : sharedGenerator().createProcessor(capabilities);
    processors.set(kind, processor);
  }
  return processor;
}

let snippet: string | undefined;

/** Explicit output style: a plan, a comparison or a choice is a surface, never a Markdown table. */
const CARDS_ROUTING = "\n\nOutput style: cards. A plan, itinerary, comparison, checklist, form, or anything the person chooses from is always an A2UI block, not a Markdown table. This replaces any earlier instruction to put such data in a Markdown table; use a table only when the person asked to read plain text. When a request leaves days, dates, budget, pace or interests open, put those choices in the surface (Slider, ChoicePicker, Tabs, CheckBox) instead of asking in prose. Keep the prose around the block to one short sentence.";

/** The Express/Direct JSON prompt for the mode, or nothing when replies carry no components or must stay Markdown. */
export function a2uiPromptSnippet(mode: InteractiveAnswerMode, output: A2uiOutputMode = "auto"): string {
  if (!showsComponentFences(mode) || output === "markdown") return "";
  if (snippet === undefined) {
    try {
      snippet = replyProcessor().promptSnippet;
    } catch (error) {
      console.warn(`[a2ui] prompt snippet unavailable: ${error instanceof Error ? error.message : String(error)}`);
      snippet = "";
    }
  }
  return snippet ? snippet + (output === "cards" ? CARDS_ROUTING : "") : "";
}

export interface A2uiParsedReply {
  /** The reply with every block that drew a surface replaced by its fence, and every block that
   * did not validate kept as plain text. */
  text: string;
  surfaces: A2uiSurfaceRecord[];
}

function surfaceDataModel(message: A2uiWireMessage): Record<string, unknown> {
  const value = message.createSurface?.dataModel;
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function rewriteSurface(messages: A2uiWireMessage[], from: string, to: string): A2uiWireMessage[] {
  return messages.map((message) => {
    const entry = message.createSurface ?? message.updateComponents ?? message.updateDataModel ?? message.deleteSurface;
    if (!entry || entry.surfaceId !== from) return message;
    const key = message.createSurface ? "createSurface" : message.updateComponents ? "updateComponents" : message.updateDataModel ? "updateDataModel" : "deleteSurface";
    return { ...message, [key]: { ...entry, surfaceId: to } };
  });
}

/** Reads the reply's A2UI blocks one at a time, so a block that fails takes only its own place as
 * plain text and the prose around it, and every good block, still draw. */
export function parseA2uiReply(reply: string): A2uiParsedReply {
  const surfaces: A2uiSurfaceRecord[] = [];
  const pieces: string[] = [];
  let last = 0;
  for (const match of reply.matchAll(BLOCK)) {
    const at = match.index ?? 0;
    pieces.push(reply.slice(last, at));
    last = at + match[0].length;
    try {
      const parts = replyProcessor(match[1] === "a2ui-json" ? "json" : "express").parseResponse(match[0]);
      const messages = parts.flatMap((part) => (part.type === "a2ui" ? part.a2ui : [])) as unknown as A2uiWireMessage[];
      const created = messages.flatMap((message) => (message.createSurface && a2uiSurfaceId(message)) || []);
      if (created.length !== 1) throw new Error("a block must create exactly one surface");
      const index = surfaces.length;
      const placeholder = `p${index}`;
      surfaces.push({
        id: placeholder,
        messages: rewriteSurface(messages, created[0]!, placeholder),
        dataModel: surfaceDataModel(messages.find((message) => message.createSurface) ?? {}),
      });
      pieces.push(`\n\n${a2uiFence(index)}\n\n`);
    } catch (error) {
      console.warn(`[a2ui] block not drawn: ${error instanceof Error ? error.message : String(error)}`);
      pieces.push(`\n\n${a2uiRawFence(match[0])}\n\n`);
    }
  }
  if (!pieces.length) return { text: reply, surfaces };
  pieces.push(reply.slice(last));
  return { text: pieces.join("").replace(/\n{3,}/g, "\n\n").trim(), surfaces };
}

/** Gives every surface the message id it will live under; the text's fences already name it by index. */
export function a2uiSurfacesForMessage(surfaces: A2uiSurfaceRecord[], messageId: string): A2uiSurfaceRecord[] {
  return surfaces.map((surface, index) => ({
    id: `${messageId}:${index}`,
    messages: rewriteSurface(surface.messages, surface.id, `${messageId}:${index}`),
    dataModel: surface.dataModel,
  }));
}
