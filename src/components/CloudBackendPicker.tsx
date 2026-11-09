import type { CloudBackend } from "../../shared/wire";
import { SIMULAR_MCP_URL } from "../../shared/simular";
import { cn } from "@/lib/cn";
import { simularBoxReady, useMcpServers } from "@/lib/mcp-servers";
import { useStore } from "@/state/store";
import { t } from "@/lib/i18n";

const BACKENDS = [
  ["box", "botAccess.cloud.boat"],
  ["simular", "botAccess.cloud.simular"],
  ["vps", "botAccess.cloud.selfHostedVps"],
] as const;

function descriptionOf(value: CloudBackend, compact: boolean): string {
  if (value === "vps") return compact ? t("botAccess.cloud.vpsDescription") : t("botAccess.cloud.vpsAutoDescription");
  if (value === "simular") return t("botAccess.cloud.simularDescription");
  return compact ? t("botAccess.cloud.hostedDescription") : t("botAccess.cloud.hostedBackendDescription");
}

export function CloudBackendPicker({
  value,
  compact = false,
  onChange,
}: {
  value: CloudBackend;
  compact?: boolean;
  onChange: (backend: CloudBackend) => void;
}) {
  const { state } = useStore();
  const { servers } = useMcpServers();
  const simularReady = simularBoxReady(servers);
  if (state.config?.cloudHome) return null;
  return (
    <div className="mt-3 rounded-lg bg-inset p-3">
      <div className="text-[12px] font-medium text-ink">{compact ? t("botAccess.cloud.provider") : t("botAccess.cloud.backend")}</div>
      <div className="mt-0.5 text-[12px] text-ink-secondary">{descriptionOf(value, compact)}</div>
      <div className="mt-2 flex overflow-hidden rounded-lg border border-hairline/40">
        {BACKENDS.map(([backend, labelKey], i) => {
          const blocked = backend === "simular" && !simularReady;
          return (
            <button
              key={backend}
              onClick={() => onChange(backend)}
              disabled={blocked}
              aria-pressed={value === backend}
              title={blocked ? t("botAccess.cloud.simularConnect", { url: SIMULAR_MCP_URL }) : undefined}
              className={cn(
                "flex-1 py-1.5 text-[12px]",
                i > 0 && "border-l border-hairline/40",
                value === backend ? "bg-raised text-ink" : "text-ink-secondary hover:bg-raised/60 hover:text-ink",
                blocked && "cursor-not-allowed opacity-50 hover:bg-transparent",
              )}
            >
              {t(labelKey)}
            </button>
          );
        })}
      </div>
      {!simularReady && (
        <div className="mt-1.5 text-[11px] leading-4 text-ink-secondary">
          {t("botAccess.cloud.simularConnect", { url: SIMULAR_MCP_URL })}
        </div>
      )}
    </div>
  );
}
