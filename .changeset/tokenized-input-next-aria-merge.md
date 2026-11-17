---
"@salt-ds/lab": patch
---

Fixed `TokenizedInputNext` replacing the `FormField` label when `aria-labelledby` is passed, and ignoring `aria-describedby` inside a `FormField`. Both are now merged on the input in the same order as other form controls: the `FormField` values, then `textAreaProps`, then the root prop.
