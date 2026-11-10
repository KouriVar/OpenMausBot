// How a turn's place is worded when it could not be had: a passing cause (the machine was busy, the provider answered with
// a number) reads as its own line, and anything else as "didn't start" with the reason. Kept out of the main server, which
// only supplies what these lines need.

import { listManagedBoats, type ManagedBoatOwner } from "./boat.ts";
import { placeUnavailable } from "./surface.ts";
import { cloudRefusal, type PlaceRow } from "../shared/place-view.ts";
import type { AppConfig } from "./config.ts";
import type { Surface } from "../shared/wire.ts";
import type { PlaceSource } from "../shared/place-view.ts";

export interface PlaceFailureDeps {
  cfg: AppConfig;
  /** A Cloud home answers a missing paid computer differently from a self-hosted server. */
  cloudHome: boolean;
  /** The machines this installation manages, for naming who else holds the one this bot wanted. */
  owners(): ManagedBoatOwner[];
  /** This installation's own Boat account covers the plan's included computers. */
  boatIncluded(): boolean;
  /** Already worded, or no longer this turn's: it travels on as it is. */
  settled(error: unknown): boolean;
}

/** Who else's bot already holds a computer here, so "in use" can name them. */
async function cloudComputerHolders(deps: PlaceFailureDeps, botId: string): Promise<string[]> {
  try {
    const listed = await listManagedBoats(deps.cfg, deps.owners(), { adoptLegacy: false });
    return [...new Set(listed.instances
      .filter((instance) => instance.ownerBotId && instance.ownerBotId !== botId && instance.ownerName)
      .map((instance) => instance.ownerName!))];
  } catch {
    return [];
  }
}

export function createPlaceFailures(deps: PlaceFailureDeps) {
  /** A refused place: the provider's own reason when it named one. */
  const asPlaceFailure = async (
    error: unknown, place: Surface, source: PlaceSource, bot: { id: string; name: string }, backend: "box" | "vps" | "simular" = "box",
  ): Promise<unknown> => {
    if (deps.settled(error)) return error;
    const failure = error instanceof Error ? error : new Error(String(error));
    const cause = failure.message.trim().replace(/[\s.]+$/, "");
    if (place !== "cloud" || backend === "vps" || (failure as { code?: unknown }).code === "managed_policy") {
      return placeUnavailable(place, {
        state: "place-failed", params: { bot: bot.name, cause: `${cause.charAt(0).toUpperCase()}${cause.slice(1)}.` }, source,
      }, deps.cloudHome);
    }
    const { boatCode, boatStatus, status } = failure as { boatCode?: unknown; boatStatus?: unknown; status?: unknown };
    const providerStatus = typeof boatStatus === "number" ? boatStatus : typeof status === "number" ? status : undefined;
    const read = cloudRefusal({
      message: failure.message,
      ...(typeof boatCode === "string" ? { code: boatCode } : {}),
      ...(providerStatus !== undefined ? { status: providerStatus } : {}),
    }, deps.boatIncluded());
    const row: PlaceRow = { state: read.state, params: { bot: bot.name, ...read.params }, source };
    if (row.state === "cc-at-once") row.params.holders = await cloudComputerHolders(deps, bot.id);
    return placeUnavailable(place, row, deps.cloudHome);
  };

  /** No paid account to make a cloud desktop with: the person's own key, or their plan's computers. */
  const boatNotConfigured = (bot: { name: string }, source: PlaceSource) => placeUnavailable(
    "cloud", { state: deps.cloudHome ? "cc-unavailable" : "cc-needs-key", params: { bot: bot.name }, source }, deps.cloudHome,
  );

  return { asPlaceFailure, boatNotConfigured };
}
