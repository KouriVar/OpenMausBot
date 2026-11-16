/** The personal build's own version, shown in the app as "V2026.1116.1" while the bundle keeps the same semver. Patches
 * (2026.1116.2 …) show their own number, so the label alone says which release is installed. */
export const FORK_VERSION_DISPLAY = "V2026.1116.1";
export const FORK_VERSION_SEMVER = "2026.1116.1";

/** The ui build this installed app runs. Bumped by every `apply-ui-patch.sh` run while the bundle stays put. */
export const FORK_UI_BUILD = "2026.1116.1";

/** "V2026.1116.1" for this personal build, the version as given for anything else (servers, tests, upstream). */
export function displayAppVersion(version: string): string {
  return version === FORK_VERSION_SEMVER ? FORK_VERSION_DISPLAY : version;
}

/** The menu and About shape. Three parts already name the release, so the label stands alone; anything else is unchanged. */
export function displayAppVersionWithBuild(version: string): string {
  return version === FORK_VERSION_SEMVER ? FORK_VERSION_DISPLAY : version;
}
