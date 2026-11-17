---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
---

`FormFieldLabel` now logs a development warning when a form control it labels has an `aria-label`. The `FormFieldLabel` provides the accessible name, so the `aria-label` is ignored. To add to the name, use `aria-labelledby`. To add a description, use `aria-describedby`.

The default "date input" label of `DateInputSingle` doesn't trigger the warning, and nor do the labels `DateInputRange` keeps for each input.
