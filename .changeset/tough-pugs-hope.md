---
"@salt-ds/lab": minor
---

Refactored FileDropZone.

- FileDropZone has been split into three composible pieces: FileDropZone, DileDropZoneIcon and FileDropZoneTrigger.
- Validation is handled outside of the component. `onFilesAccepted`, `onFilesRejected` and `validate` have been replaced with `onDrop` and `status`.
- Aligned styling to Salt.
