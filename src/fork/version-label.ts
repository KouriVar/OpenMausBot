/** The personal build's own version, shown in the app as "V0.4.0" while the bundle keeps the same semver. Patches
 * (0.4.1, 0.4.2 …) show their own number, so the label alone says which release is installed. */
export const FORK_VERSION_DISPLAY = "V0.7.3";
export const FORK_VERSION_SEMVER = "0.7.3";

/** The ui build this installed app runs. Bumped by every `apply-ui-patch.sh` run while the bundle stays put. */
export const FORK_UI_BUILD = "0.7.3";

/** "V0.4.0" for this personal build, the version as given for anything else (servers, tests, upstream). */
export function displayAppVersion(version: string): string {
  return version === FORK_VERSION_SEMVER ? FORK_VERSION_DISPLAY : version;
}

/** The menu and About shape. Three parts already name the release, so the label stands alone; anything else is unchanged. */
export function displayAppVersionWithBuild(version: string): string {
  return version === FORK_VERSION_SEMVER ? FORK_VERSION_DISPLAY : version;
}
