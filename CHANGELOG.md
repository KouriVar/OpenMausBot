# Changelog

All notable changes to this fork are documented here. This fork tracks
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot); entries
below are local customizations on top of upstream `v0.1.149`.

## Unreleased

### Changed

- **Sidebar: search and new-chat buttons moved to the bottom.** The search
  button and the `+` button now sit at the bottom of the sidebar, just above
  the tools/plugins button, instead of at the top.
  - Icon sidebar (`density === "icons"`): search and `+` move into a new
    `SidebarBottomActions` component (`data-sidebar-bottom-actions`) rendered
    above the footer, outside the scrolling list. The `+` menu now opens
    upward (`bottom-full`) so it stays inside the window. The block lives in
    its own file to keep `Sidebar.tsx` under the repo's file-size ratchet.
  - Avatar rail / compact mode (`SidebarSimpleRail.tsx`): `SimpleRailFooter`
    gained an optional `topActions` slot, and the rail renders search and `+`
    there, above the Connect apps and profile buttons. The top of the rail now
    holds only the avatar list. The `+` menu still opens to the right
    (`left-full`), the only direction with room in a narrow rail.
  - The full (non-icon) sidebar list keeps its buttons at the top.
  - Search still opens the command palette; no behaviour change.

- **Model picker removed from the chat header** (`ChatView.tsx`). The header no
  longer renders `ModelPicker`; the model is chosen from settings instead. This
  is a personal-build change and is not intended for upstream.

### Tests

- Updated upstream tests that asserted the old layout:
  `ChatView.controls.test.ts` (header no longer shows the model picker) and
  `Sidebar.header.test.ts` / `Sidebar.simple-layout.test.ts` (search and `+` at
  the foot of the rail). `pnpm typecheck` passes and the affected suites
  (`ChatView*`, `Sidebar*`) are green.

### Added

- `apply-ui-patch.sh` — builds the renderer and copies `dist/` into the
  installed `/Applications/OpenMausBot.app/Contents/Resources/ui/`, with a
  timestamped backup of the previous UI. Re-run it after an app auto-update
  overwrites the patched interface files.

### Notes

- `.ui-backup-*/` directories are ignored by git; they are local snapshots made
  by `apply-ui-patch.sh`.
