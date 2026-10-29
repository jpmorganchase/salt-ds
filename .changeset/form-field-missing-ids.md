---
"@salt-ds/core": patch
---

Fixed `FormField` adding `aria-labelledby` and `aria-describedby` to its control when no `FormFieldLabel` or `FormFieldHelperText` is rendered, so the control referred to IDs that didn't exist. They're now only added while a `FormFieldLabel` or `FormFieldHelperText` is rendered, including in `useFormFieldProps().a11yProps`. A `Tooltip` used as a `FormField`'s helper text describes the control while it's shown.
