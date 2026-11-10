---
"@salt-ds/core": patch
---

Fixed `Stepper` not matching the design:

- A pending `Step` now shows `ProgressDraftIcon` and an active `Step` now shows `ProgressActiveIcon`. These are the new defaults for `PendingIcon` and `ActiveIcon` in `SemanticIconProvider`, so components that read them from `useIcon()` also show the new icons. To keep the previous icons, pass `iconMap={{ PendingIcon: StepDefaultIcon, ActiveIcon: StepActiveIcon }}` to `SemanticIconProvider`.
- The track after a completed or in-progress `Step` now uses the accent color.
- A `Step` description without a `status` now uses the secondary text color.
- A top-level `Step` label is now bold only when that step is active or contains the active step.
