---
"@salt-ds/core": patch
---

Fixed `Stepper` not matching the design:

- A pending `Step` now shows `ProgressDraftIcon`, which is the new default `PendingIcon` in `SemanticIconProvider`. Components that read `PendingIcon` from `useIcon()` also show the new icon. To keep the previous icon, pass `iconMap={{ PendingIcon: StepDefaultIcon }}` to `SemanticIconProvider`.
- The track after a completed or in-progress `Step` now uses the accent color.
- A `Step` description without a `status` now uses the secondary text color.
- A top-level `Step` label is now bold only when that step is active or contains the active step.
