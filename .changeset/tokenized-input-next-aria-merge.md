---
"@salt-ds/lab": patch
---

Fixed `TokenizedInputNext` replacing the `FormField` label when `aria-labelledby` is passed, and ignoring `aria-describedby` inside a `FormField`. Both are now merged with the `FormField` values on the input.
