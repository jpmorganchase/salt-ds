# Salt

<!-- salt-ai-navigation: staged; activation requires the verified terminal release and post-release discovery gate. -->

[![@salt-ds/core](https://img.shields.io/npm/v/@salt-ds/core.svg?label=@salt-ds/core)](https://www.npmjs.com/package/@salt-ds/core)
[![@salt-ds/lab](https://img.shields.io/npm/v/@salt-ds/lab.svg?label=@salt-ds/lab)](https://www.npmjs.com/package/@salt-ds/lab)
[![@salt-ds/theme](https://img.shields.io/npm/v/@salt-ds/theme.svg?label=@salt-ds/theme)](https://www.npmjs.com/package/@salt-ds/theme)
[![@salt-ds/icons](https://img.shields.io/npm/v/@salt-ds/icons.svg?label=@salt-ds/icons)](https://www.npmjs.com/package/@salt-ds/icons)

Salt is a React design system with production-ready components, accessible
interaction patterns and a flexible theming system. The current J.P. Morgan
theme supports light and dark modes and multiple UI densities.

## Start a new application

Install the stable component package, theme and icons:

```sh
npm install @salt-ds/core @salt-ds/theme @salt-ds/icons
```

Use `SaltProviderNext` with the current theme CSS:

- `@salt-ds/theme/css/global.css`
- `@salt-ds/theme/css/theme-next.css`

The [Developing with Salt guide](https://www.saltdesignsystem.com/salt/getting-started/developing)
is the canonical setup reference. The repository also contains complete,
build-checked [Vite](./examples/apps/vite-starter) and
[Next App Router](./examples/apps/next-app-router) applications.

`SaltProvider` with `@salt-ds/theme/index.css` remains supported for
applications that are maintaining or migrating the legacy UITK visual theme.
New applications should use the setup above.

Add packages for specific use cases only when needed. For example,
`@salt-ds/lab` contains experimental components whose APIs may change, while
packages such as `@salt-ds/date-components`, `@salt-ds/ag-grid-theme` and
`@salt-ds/highcharts-theme` cover focused integrations.

## Documentation

- [Developing with Salt](https://www.saltdesignsystem.com/salt/getting-started/developing)
- [Components](https://www.saltdesignsystem.com/salt/components)
- [Patterns](https://www.saltdesignsystem.com/salt/patterns)
- [Themes](https://www.saltdesignsystem.com/salt/themes)
- [Support and contributions](https://www.saltdesignsystem.com/salt/support-and-contributions)

Storybook and Chromatic remain maintainer tools for component development and
visual regression testing. Public setup and pattern guidance is available on
the documentation site and does not require Storybook.

## Accessibility

Salt targets WCAG 2.1 and tests supported browser and assistive-technology
combinations. See [Supported platforms](https://www.saltdesignsystem.com/salt/about/supported-platforms)
for the current support statement.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the repository workflow, package
inventory and verification expectations.

## License

Salt packages are distributed under the [Apache License 2.0](./LICENSE).

## Thanks

Thanks to [Chromatic](https://www.chromatic.com/) for providing the visual
testing platform used by maintainers to review UI changes and catch visual
regressions.
