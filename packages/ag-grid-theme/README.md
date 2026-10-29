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

See the full
[documentation and examples](https://www.saltdesignsystem.com/salt/components/ag-grid-theme).
