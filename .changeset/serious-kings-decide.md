---
"@salt-ds/lab": minor
---

enabled uncontrolled/un-controlled open behaviour for `DatePicker`

- added `openOnClick` props to `DatePicker`.
- when the triggering element (`DateInput`) is focused, arrow key down, will now open the DatePicker by default
- revise the controlled behaviour of the `open` prop on `DatePickerOverlay`.
