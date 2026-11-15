# A2UI basic catalog

`server/a2ui/basic-catalog.json` is the v1.0 basic catalog document from
google/a2ui (`catalogs/basic/v1/catalog.json`, commit 3ed9601), Apache-2.0,
as shipped in `@a2ui/web_core` 0.15.0
(`src/v1_0/schemas/catalogs/basic/catalog.json`).

Two entries are ours, not Google's:

- `components.Table` and its `#/components/Table` reference in
  `$defs.anyComponent.oneOf`: the table OMB draws with its own text and divider
  tokens.

Everything else is unchanged. See `LICENSE` here for the Apache License 2.0.
