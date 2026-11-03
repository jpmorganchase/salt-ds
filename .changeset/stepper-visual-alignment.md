---
"@salt-ds/core": patch
---

Updated `Stepper` to match new design:

- A pending `Step` now shows `ProgressDraftIcon`, which is the new default `PendingIcon` in `SemanticIconProvider`.
- The track after a completed or in-progress `Step` now uses the accent color.
- A `Step` description now uses the secondary text color.
- Only the active top-level `Step`, or the top-level `Step` that contains the active nested step, now has a bold label.
