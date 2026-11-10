---
"@salt-ds/core": minor
---

Updated `Stepper` styling so the current step and completed progress are easier to pick out:

- Pending and active steps use `ProgressDraftIcon` and `ProgressActiveIcon`, matching the in-progress icon. These are the default `PendingIcon` and `ActiveIcon` in `SemanticIconProvider`, so `useIcon()` returns them too. To keep the previous icons, pass `iconMap={{ PendingIcon: StepDefaultIcon, ActiveIcon: StepActiveIcon }}`.
- Only the active step's label uses the bolder font weight.
- The track after completed and in-progress steps uses the accent color.
- Descriptions use the label text style and the secondary text color, so they read as supporting text. Descriptions of steps with a `status` keep their status color.
- In a vertical `Stepper`, labels are centered with their icons, and steps are evenly spaced whether or not they have a description.
