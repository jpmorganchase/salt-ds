---
"@salt-ds/core": patch
---

- Updated indeterminate Checkboxes and Radio Buttons to use the native indeterminate attribute. This ensures screenreaders correctly announce the control.
- Fixed Checkboxes and Radio Buttons not being announced as read-only.
- Updated external Link's accessible text to remove the redundant text ("Link").
- Fixed Switch's thumb being announced when the switch receives focus.
- Changed standalone ToggleButton's role from checkbox to button and updated the neccessary aria attributes.
- Fixed Tooltip's being announced as clickable and focusable.
