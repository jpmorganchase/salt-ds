---
"@salt-ds/core": patch
---

Fixed `TextNotation` and `Text` with `styleAs="notation"` using the body text font weight instead of `--salt-text-notation-fontWeight`. Notation text now has a semibold weight by default, matching the design and other components that use notation text, such as `Avatar` and `Badge`.
