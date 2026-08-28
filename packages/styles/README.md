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

## Component style injection

Salt normally injects a component's CSS into the document where that component
renders. Component authors working across documents, for example in a desktop
application with pop-out windows, can use `useComponentCssInjection` with the
current window supplied by `@salt-ds/window`.

Import component CSS as a string and pass both the CSS and destination window
to the hook:

```tsx
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import exampleCss from "./Example.css";

export function Example() {
  const targetWindow = useWindow();

  useComponentCssInjection({
    css: exampleCss,
    window: targetWindow,
  });

  return <div className="example">Example</div>;
}
```

The hook deduplicates matching CSS in a window and removes it after the final
consumer unmounts. A `testId` can label the generated style element for tests.
Applications should normally use Salt's provider setup rather than call this
low-level hook directly.

### Insertion point

Use `InsertionPointProvider` when injected component styles must appear at a
specific point in a document or shadow root. The supplied node is an ordering
boundary; injected styles are inserted before it.

```tsx
import { InsertionPointProvider } from "@salt-ds/styles";

<InsertionPointProvider insertionPoint={document.head.lastElementChild}>
  <App />
</InsertionPointProvider>;
```

Verify the insertion point belongs to the same document as the rendered Salt
content, and test the resulting cascade in every supported host window.

See [Style injection](https://www.saltdesignsystem.com/salt/getting-started/style-injection).
