---
"@salt-ds/lab": patch
---

Fixed props that `TokenizedInputNext` and `ToastGroup` ignored or replaced.

- `TokenizedInputNext` calls the `onChange`, `onBlur`, `onFocus` and `onKeyDown` passed in `textAreaProps` as well as its own handlers, so typing still adds items. It also keeps its own class when `textAreaProps.className` is set.
- `ToastGroup` forwards its ref to its root element.
