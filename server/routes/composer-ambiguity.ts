import { AMBIGUITY_MAX_TEXT, AMBIGUITY_TIMEOUT_MS } from "../../shared/composer-ambiguity.ts";
import { ambiguityPrompt, parseAmbiguityAnswer } from "../composer-ambiguity.ts";
import type { BotRecord } from "../store.ts";
import { PASS, type RouteHandler } from "./table.ts";

export interface ComposerAmbiguityDeps {
  bot(botId: string): BotRecord | null;
  task(botId: string, threadId: string): unknown;
  writer(botId: string, analysisModel?: { instanceId: string; model: string }): ((prompt: string, options: { timeoutMs?: number }) => Promise<string>) | undefined;
  /** Settings → General → Input: the same model the person chose for analysis, if any. */
  analysisModel?(): { instanceId: string; model: string } | undefined;
}

/** The composer's background pass: the draft in, at most three marked words out. Failure is an empty answer, never a stall. */
export function createComposerAmbiguityRoutes(deps: ComposerAmbiguityDeps): RouteHandler {
  return async ({ req, res, path, method, json, readBody }) => {
    if (path !== "/api/composer/ambiguities" || method !== "POST") return PASS;
    const body = await readBody(req, 16_384);
    const text = typeof body?.text === "string" ? body.text.slice(0, AMBIGUITY_MAX_TEXT) : "";
    const botId = typeof body?.botId === "string" ? body.botId : "";
    const threadId = typeof body?.threadId === "string" ? body.threadId : "";
    if (!text.trim() || !botId) return json(res, 400, { error: "text and botId are required" });
    if (!deps.bot(botId)) return json(res, 404, { error: "no such bot" });
    if (threadId && !deps.task(botId, threadId)) return json(res, 404, { error: "no such conversation" });
    res.setHeader("cache-control", "no-store");
    const writer = deps.writer(botId, deps.analysisModel?.());
    if (!writer) return json(res, 200, { marks: [] });
    try {
      const answer = await writer(ambiguityPrompt(text), { timeoutMs: AMBIGUITY_TIMEOUT_MS });
      return json(res, 200, { marks: parseAmbiguityAnswer(answer, text) });
    } catch {
      return json(res, 200, { marks: [] });
    }
  };
}
