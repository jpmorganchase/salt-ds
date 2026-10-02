---
"@salt-ds/core": patch
"@salt-ds/lab": patch
---

Fixed types when using Salt with version 19 of `@types/react`:

- APIs that take a ref object, such as `useResizeObserver`, accept refs created with `useRef(null)`. Version 19 types these as `RefObject<T | null>`, which caused a type error.
- Types no longer use the global `JSX` namespace, which version 19 removed. Types that used it, such as the return types of `ComboBox`, `Dropdown` and `ListBox`, resolved to `any`, or caused errors in Salt's declaration files when `skipLibCheck` is disabled. `ToggleButtonProps` also caused an error when `skipLibCheck` is disabled.
