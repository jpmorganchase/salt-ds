---
"@salt-ds/lab": minor
---

Added `validationStatus` to `InputNext`, `FormFieldNext`, `FormFieldContextNext`

Added `StatusAdornment`, `ErrorAdornment`, `SuccessAdornment`, `WarningAdornment` components

Removed `disabled` prop from `FormFieldHelperText`, `FormFieldLabel`

Renamed `useA11yValueValue` to `u11yValueAriaProps`
Removed `disabled` and `readOnly` out of `u11yValueAriaProps` and separated out `disabled`, `readOnly` within `FormFieldContextNext`
Removed `useA11yValue` hook

Removed `type`, `onChange` prop from InputNext
