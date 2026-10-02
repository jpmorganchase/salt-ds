---
"@salt-ds/lab": patch
---

Fixed `CascadingMenu` not opening with React 19 when its trigger element has its own ref.

Fixed React warnings about a `key` prop being spread into JSX in `List`, `Tabs` and `Toolbar`, and removed `defaultProps` from `OverflowSeparator`, which React 19 doesn't support on function components.

Updated `react-window` to `^1.8.11`, which supports React 18 and 19.
