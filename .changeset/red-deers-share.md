---
"@salt-ds/core": patch
---

Fixed file drop zone not allowing the same file to be selected via `onChange` of `FileDropZoneTrigger`.
Updated first argument event type of `onChange` to `ChangeEvent`, to better align with underlying event.

Closes #3591.
