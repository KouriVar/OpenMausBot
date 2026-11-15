// One stored A2UI surface, rendered by the chat: a processor reads the messages
// the server validated, the person's filled-in data model is laid over them,
// and every edit is saved back so a restart keeps the values.
import { useEffect, useState, type ComponentType } from "react";

import { A2uiSurface, MarkdownComponentContext, type MarkdownComponentProps } from "@a2ui/react";
import { MessageProcessor } from "@a2ui/web_core";
import type { ActionPayload, SurfaceModel } from "@a2ui/web_core";

import { api } from "@/state/store";
import { randomUuid } from "@/lib/random-uuid";
import { t } from "@/lib/i18n";
import type { A2uiSurfaceRecord } from "../../../shared/a2ui";
import { ombA2uiCatalog } from "./catalog";

function sendAction(input: { botId: string; threadId?: string; messageId: string; surfaceId: string; action: ActionPayload }): void {
  void api(`/api/bots/${input.botId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      threadId: input.threadId,
      sendId: randomUuid(),
      a2uiAction: { messageId: input.messageId, surfaceId: input.surfaceId, name: input.action.name, context: input.action.context },
    }),
  }).catch((error: unknown) => {
    console.warn(`[a2ui] action not sent: ${error instanceof Error ? error.message : String(error)}`);
  });
}

function saveModel(input: { botId: string; threadId?: string; messageId: string; surfaceId: string; dataModel: unknown }): void {
  void api(`/api/bots/${input.botId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      threadId: input.threadId,
      a2uiModel: { messageId: input.messageId, surfaceId: input.surfaceId, dataModel: input.dataModel },
    }),
  }).catch((error: unknown) => {
    console.warn(`[a2ui] values not saved: ${error instanceof Error ? error.message : String(error)}`);
  });
}

export function A2uiInline({ botId, threadId, messageId, surface, index, viewOnly, renderMarkdown }: {
  botId: string; threadId?: string; messageId: string; surface: A2uiSurfaceRecord; index: number; viewOnly?: boolean;
  renderMarkdown: ComponentType<MarkdownComponentProps>;
}) {
  // The row is immutable, so the first record is the one this mount draws. Later
  // saves of the same row come back with the values this mount already has;
  // rebuilding the processor for them would throw away focus mid-edit.
  const [stored] = useState(surface);
  const [model, setModel] = useState<SurfaceModel | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const processor = new MessageProcessor([ombA2uiCatalog], (action) => {
      if (!viewOnly) sendAction({ botId, threadId, messageId, surfaceId: stored.id, action });
    });
    try {
      processor.processMessages(stored.messages as never);
      const surfaceModel = processor.model.surfacesMap.get(stored.id);
      if (!surfaceModel) throw new Error("the surface did not arrive");
      if (stored.dataModel && Object.keys(stored.dataModel).length > 0) surfaceModel.dataModel.set("/", stored.dataModel);
      setModel(surfaceModel);
      return () => processor.dispose();
    } catch (error) {
      console.warn(`[a2ui] surface not drawn: ${error instanceof Error ? error.message : String(error)}`);
      processor.dispose();
      setFailed(true);
      return undefined;
    }
  }, [botId, threadId, messageId, stored, viewOnly]);

  useEffect(() => {
    if (!model || viewOnly) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const flush = () => saveModel({ botId, threadId, messageId, surfaceId: stored.id, dataModel: model.dataModel.get("/") });
    const saved = model.dataModel.subscribe("/", () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        flush();
      }, 500);
    });
    return () => {
      if (timer !== undefined) flush();
      saved.unsubscribe();
    };
  }, [botId, threadId, messageId, model, stored.id, viewOnly]);

  if (failed) return <div className="text-[12px] leading-4 text-ink-tertiary">{t("a2ui.failed")}</div>;
  if (!model) return null;
  return (
    <div data-a2ui-surface={index} dir="auto" className="w-full min-w-0">
      <MarkdownComponentContext.Provider value={renderMarkdown}>
        <A2uiSurface surface={model as never} />
      </MarkdownComponentContext.Provider>
    </div>
  );
}
