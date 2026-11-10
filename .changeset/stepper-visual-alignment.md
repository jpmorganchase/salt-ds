---
"@salt-ds/core": patch
---

Updated `Stepper` to match the design:

- Pending and active steps use `ProgressDraftIcon` and `ProgressActiveIcon`, so they're visually consistent with the in-progress step icon.
- Only the active step's label is bold, so the current step stands out.
- The track after completed and in-progress steps uses the accent color, so progress is easier to see.
- Descriptions use the label text style, and the secondary text color unless the step has a `status`, so they clearly read as supporting text.
- In a vertical `Stepper`, labels are centered with their icons, and steps are evenly spaced whether or not they have a description.
