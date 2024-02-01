---
"@salt-ds/core": patch
---

- Updated indeterminate `Checkbox` and `RadioButton` to use the native indeterminate attribute. This ensures screen readers correctly announce the control.
- Fixed `Checkbox` as `RadioButtonGroup` not being announced as read-only by setting `aria-readonly`.
- Updated external `Link`'s accessible text to remove the redundant text ("Link").
- Fixed `Switch`'s thumb being announced when the switch receives focus.
- Changed standalone `ToggleButton`'s role from checkbox to button and updated the necessary aria attributes.
- Fixed `Tooltip` being announced as clickable and focusable.
