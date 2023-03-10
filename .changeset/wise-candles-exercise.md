---
"@salt-ds/data-grid": patch
"@salt-ds/lab": patch
---

RadioButton

Removed `RadioButtonBase` and replaced with `RadioButton`
Removed `icon` prop; icon is not customizable any more.
Added `inputProps` prop to be passed to the radio input.
Added `error` prop for error state styling.

RadioButtonGroup

Removed `icon` prop; icon is not customizable any more.
Removed `legend` prop; will be implemented by FormField.
Removed `radios` prop; should be the users' responsibility to provide the nested RadioButtons as children.
Replaced `row` prop with `direction` prop.
Added `labelWrap` prop.

RadioButtonIcon

Added `error` prop for error state styling.
Added `disabled` prop for disabled state styling.
