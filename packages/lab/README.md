# `@salt-ds/lab`

Experimental Salt React components that are still being evaluated before they
can move to `@salt-ds/core`.

## Install

```sh
npm install @salt-ds/lab @salt-ds/core @salt-ds/theme @salt-ds/icons
```

React and React DOM are peer dependencies. Use `SaltProviderNext` with
`@salt-ds/theme/css/global.css` and `@salt-ds/theme/css/theme-next.css`.
Component CSS is injected at runtime unless style injection is disabled.

## Usage

```tsx
import { Banner } from "@salt-ds/lab";

export function Notice() {
  return <Banner>Experimental component APIs may change.</Banner>;
}
```

Lab releases are prereleases and can include breaking API changes. Evaluate
and pin the exact version before using Lab components in production.

See the [component documentation](https://www.saltdesignsystem.com/salt/components).
