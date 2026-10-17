---
"@salt-ds/core": patch
---

`Button` and `Input` now grow taller to fit their content instead of letting it overflow. This happens when a button label wraps onto more than one line or when users enlarge text, for example with the browser's text-only zoom. At their default sizes, both components look the same as before, and `--saltButton-height` and `--saltInput-height` still set an exact height.
