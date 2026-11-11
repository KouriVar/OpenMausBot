/** The personal build's own version, shown in the app as "V0.3" while the bundle keeps a semver 0.3.0. */
export const FORK_VERSION_DISPLAY = "V0.3";
const FORK_VERSION_SEMVER = "0.3.0";

/** "V0.3" for this personal build, the version as given for anything else (servers, tests, upstream). */
export function displayAppVersion(version: string): string {
  return version === FORK_VERSION_SEMVER ? FORK_VERSION_DISPLAY : version;
}
