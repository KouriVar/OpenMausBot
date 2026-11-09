# bloub (vendored)

MIT-licensed SVG bot avatar by Jérémy Perret: one shape morphing through
fourteen states, measured off a reference video frame by frame.

- Source: https://github.com/jeremy-prt/bloub
- Commit: `b4bb3c1b5f93c7b87a2e8d620f667c4093d97749`
- Copied: `src/bot/*.ts` without the `*.test.ts` files, plus the upstream
  `LICENSE` (kept beside this file).

The measurement constants (`decor.ts`, `face.ts`, `states.ts`, `skins.ts`,
`repere.ts`) are copied as they are, not retuned. Only the changes typing this
repository needs may be made here; the React wrapper lives in
`src/components/BloubAvatar.tsx` and does not touch these files.
