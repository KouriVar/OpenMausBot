/** The personal build's own version, shown in the app as "V0.2" while the bundle keeps a semver 0.2.0. */
export const FORK_VERSION_DISPLAY = "V0.2";
const FORK_VERSION_SEMVER = "0.2.0";

/** "V0.2" for this personal build, the version as given for anything else (servers, tests, upstream). */
export function displayAppVersion(version: string): string {
  return version === FORK_VERSION_SEMVER ? FORK_VERSION_DISPLAY : version;
}
