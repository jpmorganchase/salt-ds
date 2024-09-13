---
"@salt-ds/core": patch
---

- Fixed bordered form controls' activation indicator and border combining to 3px instead of 2px in:

  - Dropdown
  - ComboBox
  - Input
  - MultilineInput

- Fixed form controls' activation indicator changing color when an active field is hovered in:

  - Input
  - MultilineInput

- Updated the token applied to form controls' activation indicator to use `--salt-size-border-strong` instead of `  --salt-editable-borderWidth-active`.
