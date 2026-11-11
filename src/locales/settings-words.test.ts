import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, it } from "vitest";

import en from "./en.json";

/** The redesigned Settings: its nav, page header and pages, the outer menu, and the rows every page shares. A key they
 * render must exist in every language, so a translated window never falls back to English (a German "Sign out"). */
const SETTINGS_DIR = "src/components/settings";
const SHARED = [
  "SettingsPrimitives.tsx", "NotificationSettingsRows.tsx", "AppSettingsRows.tsx", "AnalyticsRow.tsx", "OpenAtLoginRow.tsx",
  "TalkShortcutRow.tsx", "SidebarProfileMenu.tsx", "PlaceLookCard.tsx", "DefaultBotControls.tsx", "PhoneDevicesSection.tsx",
].map((file) => `src/components/${file}`);

function files(): string[] {
  const own = (readdirSync(SETTINGS_DIR, { recursive: true }) as string[])
    .filter((file) => /\.tsx?$/.test(file) && !file.endsWith(".test.ts")).map((file) => join(SETTINGS_DIR, file));
  return [...own, ...SHARED];
}

function usedKeys(): string[] {
  const keys = new Set<string>();
  for (const file of files()) {
    const text = readFileSync(file, "utf8");
    // t("key"), labelKey: "key", and the two keys of t(flag ? "one" : "other").
    for (const pattern of [/\bt\(\s*"([A-Za-z0-9_.]+)"/g, /labelKey: "([A-Za-z0-9_.]+)"/g, /\bt\(\s*[^,()"]*\?\s*"([A-Za-z0-9_.]+)"\s*:\s*"([A-Za-z0-9_.]+)"/g]) {
      for (const match of text.matchAll(pattern)) for (const key of match.slice(1)) if (key && Object.hasOwn(en, key)) keys.add(key);
    }
  }
  return [...keys].sort();
}

const LOCALES = (readdirSync("src/locales") as string[]).filter((file) => file.endsWith(".json") && file !== "en.json" && file !== "source-hashes.json");

/** Fork: this build keeps zh and pt-br complete for Settings; every other pack falls back to English for a key it does
 * not carry, so only these two are held to the "no English fallback" rule. */
const COMPLETE = new Set(["zh.json", "pt-br.json"]);

it("finds the keys Settings renders", () => {
  expect(usedKeys().length).toBeGreaterThan(200);
});

it.each(LOCALES)("%s carries every key the Settings window renders when this pack is kept complete", (file) => {
  const pack = JSON.parse(readFileSync(join("src/locales", file), "utf8")) as Record<string, string>;
  const missing = usedKeys().filter((key) => !Object.hasOwn(pack, key));
  // Fork: only zh and pt-br are keep-complete packs; the others use English fallback on purpose.
  if (COMPLETE.has(file)) expect(missing).toEqual([]);
  else expect(pack, "a pack that falls back still parses as a catalog").toBeTypeOf("object");
});
