# `@salt-ds/window`

A small React window context used by Salt components that must target the
correct `Window` in browser, iframe and multi-window environments.

## Install

```sh
npm install @salt-ds/window
```

React and React DOM are peer dependencies. Most applications receive this
package through `@salt-ds/core` and do not need to install or configure it
directly.

## Usage

```tsx
import { WindowProvider } from "@salt-ds/window";

export function PopupRoot({ popup }: { popup: Window }) {
  return <WindowProvider window={popup}>{/* popup UI */}</WindowProvider>;
}
```

Use a real same-origin `Window` object. Cross-origin access remains subject to
browser security restrictions.

See [Developing with Salt](https://www.saltdesignsystem.com/salt/getting-started/developing).
