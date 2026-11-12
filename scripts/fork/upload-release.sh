#!/usr/bin/env bash
# Fork: publish a locally built release-out/<version>/ directory as a GitHub release.
#
# The tag must already exist on the remote. This script never creates, moves or pushes a tag:
# publishing is `gh release create` for that existing tag, so the tag stays a deliberate human
# step. It verifies SHA256SUMS.txt, lists every file and asks before uploading.
#
#   scripts/fork/upload-release.sh 0.5.1
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

usage() {
  cat <<'EOF'
usage: scripts/fork/upload-release.sh <version>

  <version>   the release tag, with or without a leading v (the tag must already exist on the remote)
EOF
}

[[ $# -eq 1 && "$1" != "-h" && "$1" != "--help" ]] || { usage >&2; exit 2; }
VERSION="${1#v}"

die() { printf 'upload-release: %s\n' "$*" >&2; exit 1; }

OUT="$REPO_ROOT/release-out/$VERSION"
[[ -d "$OUT" ]] || die "no release-out/$VERSION: run scripts/fork/release-local.sh $VERSION first"
[[ -f "$OUT/SHA256SUMS.txt" ]] || die "release-out/$VERSION has no SHA256SUMS.txt: rebuild it with release-local.sh"

if command -v sha256sum >/dev/null 2>&1; then
  ( cd "$OUT" && sha256sum -c SHA256SUMS.txt )
else
  ( cd "$OUT" && shasum -a 256 -c SHA256SUMS.txt )
fi

REMOTE="$(git remote | grep -qx fork && echo fork || echo origin)"
if ! git ls-remote --tags "$REMOTE" "refs/tags/$VERSION" | grep -q .; then
  die "tag $VERSION is not on $REMOTE. Create and push it yourself first; this script never pushes tags."
fi

echo "Files in release-out/$VERSION:"
for file in "$OUT"/*; do
  printf '  %12s  %s\n' "$(wc -c < "$file" | tr -d ' ')" "$(basename "$file")"
done
echo
cat "$OUT/SHA256SUMS.txt"
echo
read -r -p "Publish $VERSION with these files? [y/N] " answer
case "$answer" in
  y|Y|yes|YES) ;;
  *) echo "Aborted; nothing was uploaded."; exit 1 ;;
esac

gh release create "$VERSION" \
  --repo KouriVar/OpenMausBot \
  --verify-tag \
  --title "OpenMausBot $VERSION" \
  --notes-file "$REPO_ROOT/.github/fork-release-notes.md" \
  "$OUT"/*
