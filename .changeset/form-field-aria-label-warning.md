---
"@salt-ds/core": patch
---

`FormFieldLabel` now logs a development warning when a form control it labels has an `aria-label` that's ignored because the `FormFieldLabel` provides the accessible name. The warning suggests using `aria-labelledby` to add to the name, or `aria-describedby` to add a description. It isn't logged when the `aria-label` text already appears in the name as whole words, or anywhere in the name for scripts written without spaces, such as Chinese, Japanese and Thai.
