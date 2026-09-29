---
"@salt-ds/core": patch
"@salt-ds/lab": patch
"@salt-ds/theme": minor
---

Added `--salt-typography-fontStyle-normal` and `--salt-typography-fontStyle-italic` foundation tokens.

Deprecated `--salt-typography-textDecoration-italic`. Use `--salt-typography-fontStyle-italic` instead, since italic is a `font-style` value rather than a `text-decoration` value. The deprecated token remains available as an alias of `--salt-typography-fontStyle-italic` for compatibility but may be removed in a future major version.
