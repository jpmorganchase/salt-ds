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

## Portals and style injection

`WindowProvider` supplies the target `Window` to Salt components below it. Salt
components use that value when injecting their component CSS, so a React portal
rendered into a same-origin child window should wrap its Salt subtree with the
provider:

```tsx
import { SaltProvider } from "@salt-ds/core";
import { WindowProvider } from "@salt-ds/window";
import { createPortal } from "react-dom";

export function PopupPortal({ popup }: { popup: Window }) {
  return createPortal(
    <WindowProvider window={popup}>
      <SaltProvider>
        <PopupContent />
      </SaltProvider>
    </WindowProvider>,
    popup.document.body,
  );
}
```

The application still owns the child window lifecycle, portal container,
theme and global application styles. Close event listeners and references when
the child window is destroyed. A provider cannot bypass same-origin policy.

Do not clone the parent document's current style elements as the primary style
strategy. A one-time copy misses components rendered later and can copy stale
theme or content-security-policy state. Custom component authors should import
their component CSS as a string and pass `useWindow()` to
`useComponentCssInjection` from `@salt-ds/styles`, matching Salt's component
style-injection contract.

## Server rendering

The default context is `null` when no browser `window` exists. Code that opens,
measures or portals into another window must run on the client and handle a
missing or already-closed target. `WindowProvider` does not create a browser
window or defer browser-only work automatically.

## Accessibility and testing

Keep the portal within the owning React accessibility tree and test focus
entry, focus restoration, keyboard dismissal and accessible naming in the real
multi-window environment. Assistive-technology behavior can differ when a
native window, iframe or desktop shell owns the target document.

See [Developing with Salt](https://www.saltdesignsystem.com/salt/getting-started/developing).
See [Style injection](https://www.saltdesignsystem.com/salt/getting-started/style-injection)
for component CSS, insertion points and content security policy nonces.
