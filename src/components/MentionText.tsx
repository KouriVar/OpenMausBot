import { Fragment } from "react";
import { mentionRanges, type MentionPeer, type MentionPerson } from "@/lib/mentions";
import { MentionChip } from "./BloubIdentity";

export function MentionText({ text, peers, everyone = false, person, bare = false }: {
  text: string; peers: readonly MentionPeer[]; everyone?: boolean; person?: MentionPerson; bare?: boolean;
}) {
  let end = 0;
  const parts = mentionRanges(text, peers, everyone, person).map((range) => {
    const prefix = text.slice(end, range.start);
    end = range.end;
    return (
      <Fragment key={range.start}>
        {prefix}
        <MentionChip name={text.slice(range.start, range.end)} botId={range.botId} fallbackColor={range.fallbackColor}
          you={range.you} person={range.person} bare={bare} />
      </Fragment>
    );
  });
  return <>{parts}{text.slice(end)}</>;
}
