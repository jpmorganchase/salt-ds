---
"@salt-ds/lab": patch
---

Added controlled version of ListNext

- Added `highlightedIndex`, `selected` and `onChange` props to `ListNext` in order to support a controlled list.
- Removed `selected`, from `ListNextItem` so state only gets controlled by list.
- Fixed focus ring when focusing on disabled `ListNextItem`.
