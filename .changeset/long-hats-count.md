---
"@salt-ds/lab": patch
---

Added controlled version of ListNext

- Added `highlightedItem`, `selected` and `onChange` props to `ListNext` in order to support a controlled list.
- Removed `selected`, from `ListNextItem` so state only gets controlled by list.
- Fixed `onChange` not being called on keyboard selection.
- Fixed focus ring when focusing on disabled `ListNextItem`.
