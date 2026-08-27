# `@salt-ds/core`

Production-ready React components and layout primitives for Salt Design System.

## Install

```sh
npm install @salt-ds/core @salt-ds/theme @salt-ds/icons
```

React 16.14 or newer and React DOM are peer dependencies. New applications
should import `@salt-ds/theme/css/global.css` and
`@salt-ds/theme/css/theme-next.css`, then render inside `SaltProviderNext`.
Salt injects component CSS at runtime unless style injection is disabled.

## Usage

```tsx
import { Button } from "@salt-ds/core";

export function SaveButton() {
  return <Button sentiment="accented">Save</Button>;
}
```

This package does not include product-specific business logic. Use supported
component props and compose application behavior outside Salt primitives.

See the [component documentation](https://www.saltdesignsystem.com/salt/components)
and [Developing with Salt](https://www.saltdesignsystem.com/salt/getting-started/developing).
