---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
"@salt-ds/embla-carousel": patch
"@salt-ds/lab": patch
"@salt-ds/styles": patch
"@salt-ds/window": patch
---

Fixed type errors when using Salt with version 19 of `@types/react`:

- Types no longer use the global `JSX` namespace, which was removed in version 19.
- `ToggleButtonProps` no longer conflicts with the native `onChange` prop.
- APIs that take a ref object, such as `useResizeObserver`, accept refs created with `useRef(null)`.
