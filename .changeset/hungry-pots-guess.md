---
"@salt-ds/core": minor
---

Added `FileDropZone`, `FileDropZoneIcon` and `FileDropZoneTrigger` to core.

`FileDropZone` provides a target area for users to drag and drop files, such as documents or images, and automatically uploads them to the web application.

```tsx
<FileDropZone>
  <FileDropZoneIcon />
  <strong>Drop files here or</strong>
  <FileDropZoneTrigger />
</FileDropZone>
```
