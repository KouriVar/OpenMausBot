import { useEffect, useState } from "react";

import { t } from "@/lib/i18n";
import { parseRoomTurnTimeoutMinutes } from "@/lib/room-turn-timeout";
import { useStore, type Group } from "@/state/store";
import { PillSelectMenu } from "@/fork/PillSelectMenu";

export const PRESET_TURN_LIMITS = [30, 60, 120] as const;

const isPresetTurnLimit = (minutes: number): minutes is (typeof PRESET_TURN_LIMITS)[number] =>
  (PRESET_TURN_LIMITS as readonly number[]).includes(minutes);

export function useConversationTurnLimit(group: Group) {
  const { state, dispatch } = useStore();
  const globalMinutes = state.config?.rooms.turnTimeoutMinutes ?? 5;
  const task = group.dm ? undefined : group.tasks?.find((candidate) => candidate.threadId === group.threadId);
  const override = group.dm ? group.turnTimeoutMinutes : task?.turnTimeoutMinutes;
  const saved = typeof override === "number" ? override : null;
  const save = (minutes: number | null) => dispatch({
    type: "setConversationTurnLimit",
    groupId: group.id,
    threadId: group.threadId,
    minutes,
    dm: group.dm === true,
  });
  return { globalMinutes, saved, save };
}

export function ConversationTurnLimit({ group }: { group: Group }) {
  const limit = useConversationTurnLimit(group);
  const { globalMinutes, saved } = limit;
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setCustom(false);
    setError("");
  }, [group.id, group.threadId, saved]);

  const save = (minutes: number | null) => {
    setError("");
    setCustom(false);
    limit.save(minutes);
  };

  if (custom) {
    return (
      <input
        autoFocus
        aria-label={t("room.turnLimit.aria")}
        aria-invalid={Boolean(error)}
        title={error || t("room.turnLimit.help")}
        data-testid="conversation-turn-limit"
        type="number"
        min={1}
        max={1440}
        step={1}
        inputMode="numeric"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setError("");
        }}
        onBlur={() => {
          const parsed = parseRoomTurnTimeoutMinutes(draft);
          if (!parsed.ok) {
            setError(t("settings.roomTurns.range"));
            return;
          }
          save(parsed.minutes);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setCustom(false);
            setError("");
          }
        }}
        className={`h-8 w-[88px] rounded-full border bg-raised/60 px-3 text-[13px] font-medium tabular-nums text-ink outline-none ${
          error ? "border-danger/60" : "border-hairline/40 focus:border-accent"
        }`}
      />
    );
  }

  // Fork: the app's own menu, not the system's — the same one the conversation switcher and the message menu draw.
  const current = t("room.turnLimit.minutes", { minutes: saved ?? globalMinutes });
  const label = saved == null ? t("room.turnLimit.default", { minutes: globalMinutes }) : current;
  const items = [
    { key: "default", label: t("room.turnLimit.default", { minutes: globalMinutes }), checked: saved == null, onSelect: () => save(null) },
    ...PRESET_TURN_LIMITS.map((minutes) => ({
      key: `preset:${minutes}`,
      label: t("room.turnLimit.minutes", { minutes }),
      checked: saved === minutes,
      onSelect: () => save(minutes),
    })),
    ...(saved != null && !isPresetTurnLimit(saved)
      ? [{ key: "current", label: current, checked: true, onSelect: () => save(saved) }]
      : []),
    {
      key: "custom",
      label: t("room.turnLimit.custom"),
      separatorBefore: true,
      onSelect: () => {
        setDraft(saved == null ? "30" : String(saved));
        setCustom(true);
      },
    },
  ];
  return <PillSelectMenu label={label} title={t("room.turnLimit.help")} ariaLabel={t("room.turnLimit.aria")} testId="conversation-turn-limit" items={items} className="max-w-[168px]" />;
}
