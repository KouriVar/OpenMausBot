import { useId } from "react";
import type { WidgetRoot } from "../../../shared/widget";
import type { Message } from "@/state/store";
import { WidgetMessage } from "./WidgetMessage";

/**
 * A component a reply carries in an omb-ui fence: the message's own card renderer in its view-only form, because a
 * press here has no message of its own to answer, and no bubble or frame around it (the reply is the surface).
 */
export function InlineWidget({ root }: { root: WidgetRoot }) {
  const id = useId();
  const message: Message = { id: `omb-ui${id.replace(/[^\w-]/g, "")}`, role: "bot", kind: "widget", at: 0, widget: { v: 1, root } };
  return <WidgetMessage botId="" viewOnly inline message={message} />;
}
