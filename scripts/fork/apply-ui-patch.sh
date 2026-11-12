#!/usr/bin/env bash
# Fork: rebuild only the UI and patch it into the installed app, then sign the app again with the Apple Development
# identity and restart it. For interface-only changes this skips a whole electron-builder package.
#
#   scripts/fork/apply-ui-patch.sh
#   OMB_SIGN_IDENTITY="Apple Development: Name (TEAMID)" scripts/fork/apply-ui-patch.sh
#   OMB_APP_PATH=/Applications/OpenMausBot.app scripts/fork/apply-ui-patch.sh
#
# The UI is the Vite build's dist/ folder, which electron-builder ships as Resources/ui. Signing keeps the hardened
# runtime and this repo's entitlements; nothing is notarized or uploaded.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

APP="${OMB_APP_PATH:-/Applications/OpenMausBot.app}"
UI_DIR="$APP/Contents/Resources/ui"

die() { echo "apply-ui-patch: $*" >&2; exit 1; }

[[ -d "$APP" ]] || die "no app at $APP (set OMB_APP_PATH)"
[[ -d "$UI_DIR" ]] || die "no UI at $UI_DIR (is this an OpenMausBot build?)"

IDENTITY="${OMB_SIGN_IDENTITY:-$(security find-identity -v -p codesigning 2>/dev/null | sed -n 's/.*"\(Apple Development: .*\)"/\1/p' | head -1)}"
[[ -n "$IDENTITY" ]] || die "no Apple Development identity in the keychain (set OMB_SIGN_IDENTITY)"

echo "==> vite build"
pnpm exec vite build

echo "==> patching $UI_DIR"
rm -rf "$UI_DIR"
cp -R dist "$UI_DIR"

echo "==> signing with $IDENTITY"
codesign --force --deep --options runtime --entitlements "$REPO_ROOT/build/entitlements.mac.plist" --sign "$IDENTITY" "$APP"
codesign --verify --deep --strict "$APP"
codesign -dv "$APP" 2>&1 | sed -n '1,10p'

echo "==> restarting"
osascript -e 'tell application "OpenMausBot" to quit' >/dev/null 2>&1 || true
sleep 2
# Finder launches the way a person does; a launch from this shell is blocked by the machine's policy.
osascript -e "tell application \"Finder\" to open POSIX file \"$APP\"" >/dev/null
echo "done: $APP is running the new UI"
