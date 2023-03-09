---
"@salt-ds/data-grid": patch
"@salt-ds/lab": patch
---

RadioButton

Refactor API and cleanup styles
Removed `icon` prop; icon is not customisable anymore
Added `inputProps`
Added `error` prop for error state styling

RadioButtonGroup

Remove icon prop; icon is not customisable anymore
Remove legend prop; will be implemented by FormField
Remove radios prop; should be the users' responsibility
Add direction prop, replaces row prop
Add labelWrap prop
