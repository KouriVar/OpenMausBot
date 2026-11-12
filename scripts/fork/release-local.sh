#!/usr/bin/env bash
# Fork: build one version's desktop artifacts on this machine into release-out/<version>/:
# macOS arm64 dmg + zip, Windows x64 setup exe, Linux x64 AppImage, with electron-builder's
# latest*.yml update metadata and a SHA256SUMS.txt manifest.
#
# Nothing is published and git is never touched: scripts/fork/upload-release.sh uploads the
# directory once a human has looked at it.
#
#   scripts/fork/release-local.sh 0.5.1
#   scripts/fork/release-local.sh 0.5.1 --only mac,linux
#
# electron-builder builds each platform with the host's tools: macOS artifacts need a Mac, the
# NSIS setup needs wine when built off Windows, and the AppImage needs Docker when built off
# Linux. --only lets a machine build just the platforms it can.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

usage() {
  cat <<'EOF'
usage: scripts/fork/release-local.sh <version> [--only mac,win,linux]

  <version>   the version package.json already carries, with or without a leading v
  --only      comma-separated platforms to build (default: mac,win,linux)
EOF
}

VERSION=""
ONLY="mac,win,linux"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --only)
      [[ $# -ge 2 ]] || { usage >&2; exit 2; }
      ONLY="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      [[ -z "$VERSION" ]] || { echo "only one version may be named" >&2; exit 2; }
      VERSION="${1#v}"
      shift
      ;;
  esac
done

[[ -n "$VERSION" ]] || { usage >&2; exit 2; }

die() { printf 'release-local: %s\n' "$*" >&2; exit 1; }
want() { [[ ",$ONLY," == *",$1,"* ]]; }

PACKAGE_VERSION="$(node -p "require('./package.json').version")"
[[ "$PACKAGE_VERSION" == "$VERSION" ]] || die "package.json is $PACKAGE_VERSION, not $VERSION: set it first (this builds the tree's own version)"

OUT="$REPO_ROOT/release-out/$VERSION"
BUILD="$REPO_ROOT/release"
rm -rf "$OUT"
mkdir -p "$OUT"

# electron-builder writes everything into release/; collect one platform at a time so each
# platform's latest*.yml is not overwritten by the next build.
collect() {
  local label="$1"
  shift
  local found=0 pattern file
  for pattern in "$@"; do
    while IFS= read -r file; do
      [[ -n "$file" ]] || continue
      cp -f "$file" "$OUT/"
      found=1
    done < <(compgen -G "$pattern" || true)
  done
  [[ "$found" -eq 1 ]] || die "$label produced no artifacts to collect"
}

build() {
  echo "==> $*"
  "$@"
}

if want mac; then
  rm -rf "$BUILD"
  build env CSC_IDENTITY_AUTO_DISCOVERY=false pnpm package:mac:arm64
  collect "macOS" "$BUILD/*.dmg" "$BUILD/*.zip" "$BUILD/latest-mac.yml"
fi

if want win; then
  rm -rf "$BUILD"
  build env CSC_IDENTITY_AUTO_DISCOVERY=false pnpm package:win
  collect "Windows" "$BUILD/*.exe" "$BUILD/latest.yml"
fi

if want linux; then
  rm -rf "$BUILD"
  build env CSC_IDENTITY_AUTO_DISCOVERY=false pnpm package:linux
  collect "Linux" "$BUILD/*.AppImage" "$BUILD/latest-linux.yml"
fi

for metadata in latest-mac.yml latest.yml latest-linux.yml; do
  [[ -f "$OUT/$metadata" ]] || echo "release-local: note: $metadata is absent (that platform was not built here)" >&2
done

# One manifest over every artifact and update file, so upload-release.sh can verify what it sends.
if command -v sha256sum >/dev/null 2>&1; then
  hash=(sha256sum)
else
  hash=(shasum -a 256)
fi
(
  cd "$OUT"
  : > SHA256SUMS.txt
  for file in *; do
    [[ -f "$file" && "$file" != SHA256SUMS.txt ]] && "${hash[@]}" "$file" >> SHA256SUMS.txt
  done
)

echo "==> release-out/$VERSION"
ls -lh "$OUT"
