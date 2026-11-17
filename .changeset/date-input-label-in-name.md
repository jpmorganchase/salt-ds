---
"@salt-ds/date-components": patch
---

Fixed `aria-label` on `DateInputSingle` and `DateInputRange` replacing the `FormField` label and any `aria-labelledby`, which left the visible label out of the input's accessible name.

- `DateInputSingle` is now named by its `FormField` label and `aria-labelledby` when they're present, matching `Input`. Its `aria-label`, or the default "date input", is used when neither is rendered.
- `DateInputRange` now starts each input's name with the `FormField` label, followed by that input's own label, for example "Trade period Start date". A top-level `aria-label` and an `aria-label` in `startInputProps` or `endInputProps` are kept in the input's own label, and an `aria-labelledby` in `startInputProps` or `endInputProps` is now added to that input's name instead of being dropped.

These inputs' accessible names may change, so tests that query them by name, for example `getByRole("textbox", { name: "..." })`, may need updating. To name an input inside a `FormField`, use the `FormFieldLabel` and add to it with `aria-labelledby` rather than `aria-label`.
