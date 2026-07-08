---
"@salt-ds/core": patch
---

Fixed `FileDropZone` drag-and-drop handling so disabled drop zones ignore dropped files while preventing browser file navigation, and non-file drops are cancelled without invoking the file `onDrop` callback. `FileDropZoneTrigger` now composes consumer `onClick` handlers and calls `onChange` before resetting the input value.
