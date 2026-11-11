/** Fork: the app follows THIS fork's releases, never the upstream feed. The packaged app-update.yml comes from
 * electron-builder.yml's publish block (KouriVar/OpenMausBot), and Windows downloads and installs an update in place.
 * macOS builds are unsigned, so Squirrel.Mac cannot replace them: there a manual check compares the newest release tag
 * and opens its page instead. */
export const FORK_UPDATES = true;
export const FORK_UPDATES_REPO = "KouriVar/OpenMausBot";
export const FORK_UPDATES_RELEASES_URL = `https://github.com/${FORK_UPDATES_REPO}/releases/latest`;
export const FORK_UPDATES_API = `https://api.github.com/repos/${FORK_UPDATES_REPO}/releases/latest`;
/** macOS: no in-place install; the check opens the release page. Windows keeps the real updater. */
export const FORK_UPDATES_MANUAL_PAGE = process.platform === "darwin";
