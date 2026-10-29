---
"@salt-ds/date-components": patch
---

Fixed `aria-label` on `DateInputSingle` and `DateInputRange` replacing the `FormField` label and any `aria-labelledby`, which left the visible label out of the input's accessible name.

- `DateInputSingle` is now named by its `FormField` label and `aria-labelledby` when they're present, matching `Input`.
- `DateInputRange` now combines the `FormField` label with each input's label, for example "Trade period Trade date", so custom start and end labels are kept. A top-level `aria-label` names the whole field, so the `FormField` label or a top-level `aria-labelledby` replaces it, matching `DateInputSingle`. An `aria-labelledby` in `startInputProps` or `endInputProps` is now added to that input's name, alongside any `aria-label`, instead of being dropped.

These inputs' accessible names may change, so tests that query them by name, for example `getByRole("textbox", { name: "..." })`, may need updating. To name an input inside a `FormField`, use the `FormFieldLabel` and add to it with `aria-labelledby` rather than `aria-label`.
