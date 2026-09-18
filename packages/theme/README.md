# `@salt-ds/theme`

Salt's global styles, design tokens and current and legacy visual themes.

## Install

```sh
npm install @salt-ds/theme
```

## Usage

For new applications, import both current-theme styles once at the application
entry point:

```ts
import "@salt-ds/theme/css/global.css";
import "@salt-ds/theme/css/theme-next.css";
```

Render components inside `SaltProviderNext` from `@salt-ds/core`. The legacy
`@salt-ds/theme/index.css` entry remains available for applications using
`SaltProvider` while maintaining or migrating the UITK visual theme.

This package provides CSS and tokens, not React components. Amplitude font
files used by the J.P. Morgan theme are not distributed in the package.

See the [Themes documentation](https://www.saltdesignsystem.com/salt/themes).
