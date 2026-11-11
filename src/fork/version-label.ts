/** The personal build's own version, shown in the app as "V0.3" while the bundle keeps a semver 0.3.0. */
export const FORK_VERSION_DISPLAY = "V0.3";
const FORK_VERSION_SEMVER = "0.3.0";

/** The ui build this installed app runs. The bundle version cannot move without repackaging, so every
 * `apply-ui-patch.sh` run bumps this third number instead. */
export const FORK_UI_BUILD = "0.3.3";

/** "V0.3" for this personal build, the version as given for anything else (servers, tests, upstream). */
export function displayAppVersion(version: string): string {
  return version === FORK_VERSION_SEMVER ? FORK_VERSION_DISPLAY : version;
}

/** "V0.3 (0.3.1)" — the label and the ui build, in the shape the About panel shows; anything else is unchanged. */
export function displayAppVersionWithBuild(version: string): string {
  return version === FORK_VERSION_SEMVER ? `${FORK_VERSION_DISPLAY} (${FORK_UI_BUILD})` : version;
}
