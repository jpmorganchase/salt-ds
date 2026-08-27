# `@salt-ds/styles`

Low-level style injection and Content Security Policy utilities used by Salt
component packages.

## Install

```sh
npm install @salt-ds/styles
```

React and React DOM are peer dependencies. Most applications should not use
this package directly; install `@salt-ds/core` and configure its provider
instead.

## Usage

```tsx
import { CSPProvider } from "@salt-ds/styles";

export function StylesBoundary({ children }: { children: React.ReactNode }) {
  return <CSPProvider nonce="request-specific-nonce">{children}</CSPProvider>;
}
```

The nonce must come from your response security policy; do not hard-code a
production nonce. Static component CSS is the alternative when inline style
injection is not permitted.

See [Style injection](https://www.saltdesignsystem.com/salt/getting-started/style-injection).
