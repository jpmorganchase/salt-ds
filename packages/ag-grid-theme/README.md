# `@salt-ds/ag-grid-theme`

The Salt theme for [AG Grid](https://www.ag-grid.com/). Applies the Salt visual
language (typography, spacing, color, density) to AG Grid via CSS custom
properties and a small layer of selector overrides.

## Install

```sh
npm install @salt-ds/ag-grid-theme
# or
yarn add @salt-ds/ag-grid-theme
```

Peer dependencies (install separately):

- [`ag-grid-community`](https://www.npmjs.com/package/ag-grid-community) `>=28`
- [`@salt-ds/theme`](https://www.npmjs.com/package/@salt-ds/theme)

> For users on AG Grid v33+, opt back into the legacy theming system with
> `provideGlobalGridOptions({ theme: "legacy" })`. A future major version of
> this package will adopt AG Grid's new Theming API.

## Usage

```ts
import "ag-grid-community/styles/ag-grid.css";
import "@salt-ds/ag-grid-theme/salt-ag-theme.css";
```

Apply the appropriate class name on the grid wrapper:

- `ag-theme-salt-light` / `ag-theme-salt-dark`
- `ag-theme-salt-compact-light` / `ag-theme-salt-compact-dark`

Optional modifiers can be added alongside the mode class:

- `ag-theme-salt-variant-secondary`, `ag-theme-salt-variant-tertiary`,
  `ag-theme-salt-variant-zebra` — body background variants
- `ag-theme-salt-header-{primary,secondary,tertiary}` — header background
- `ag-theme-salt-header-divider-{primary,secondary,tertiary,none}` — header
  bottom border

See the full
[documentation and examples](https://www.saltdesignsystem.com/salt/components/ag-grid-theme).

## Icon font (maintainers)

`fonts/salt-icons.woff` is composed at build time from two sources, declared
in [`icons.manifest.cjs`](./icons.manifest.cjs):

1. **`@salt-ds/icons`** — most glyphs are read directly from
   `packages/icons/src/SVG/*.svg`. Updates to Salt's icon set flow into the
   font automatically on the next regen.
2. **`icons-src/`** — local custom SVGs, only for the handful of ag-grid
   icons with no Salt equivalent (checkboxes, radios, the `none` /
   `tree-indeterminate` markers, color picker).

[`scripts/build-icons.mjs`](./scripts/build-icons.mjs) resolves the manifest,
stages the SVGs into a temp directory, and invokes
[`fantasticon`](https://github.com/tancredi/fantasticon) programmatically.

- **Regenerate the font** after editing the manifest, any of the custom SVGs,
  or any referenced Salt SVG:
  ```sh
  yarn workspace @salt-ds/ag-grid-theme run regen-icons
  ```
  Errors on missing sources; warns on stale files in `icons-src/`.

- **One-time bootstrap of the custom SVGs** (if `icons-src/` only contains a
  `.gitkeep` — reverse-extracts the handful of custom glyphs from the legacy
  `salt-icons.woff` via `opentype.js`):
  ```sh
  yarn workspace @salt-ds/ag-grid-theme run icons:extract
  ```

Codepoints are locked in `icons.manifest.cjs` and mirrored as
`--ag-icon-font-code-*` custom properties in
[`css/salt-icons.css`](./css/salt-icons.css). **Never renumber an existing
icon** — append new ones at the next free codepoint.

