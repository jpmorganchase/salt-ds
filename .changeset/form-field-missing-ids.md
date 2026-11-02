---
"@salt-ds/core": patch
---

Fixed `FormField` retaining `aria-labelledby` and `aria-describedby` references when no `FormFieldLabel` or `FormFieldHelperText` is rendered. After mount, they're only present while the corresponding element is rendered, including in `useFormFieldProps().a11yProps`. Server rendering and the first hydration render retain the IDs so labels and helper text nested inside other components remain associated with the control. A `Tooltip` used as a `FormField`'s helper text describes the control while it's shown.
