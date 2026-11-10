---
"@salt-ds/core": patch
---

Fixed `Stepper` not matching the design:

- A pending `Step` now shows `ProgressDraftIcon` and an active `Step` now shows `ProgressActiveIcon`. These are the new defaults for `PendingIcon` and `ActiveIcon` in `SemanticIconProvider`, so components that read them from `useIcon()` also show the new icons. To keep the previous icons, pass `iconMap={{ PendingIcon: StepDefaultIcon, ActiveIcon: StepActiveIcon }}` to `SemanticIconProvider`.
- The track after a completed or in-progress `Step` now uses the accent color.
- A `Step` description now uses the label text style, and the secondary text color when it has no `status`.
- A `Step` label is now bold only when the step is active, at any nesting depth.
- In a vertical `Stepper`, a `Step` label is now centered with its icon, and a `Step` without a description now has the same space below it as one with a description.
