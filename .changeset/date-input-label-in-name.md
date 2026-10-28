---
"@salt-ds/date-components": patch
---

Fixed `aria-label` on `DateInputSingle` and `DateInputRange` replacing the `FormField` label and any `aria-labelledby`, which left the visible label out of the input's accessible name.

- `DateInputSingle` is now named by its `FormField` label and `aria-labelledby` when they're present, matching `Input`.
- `DateInputRange` now combines the `FormField` label with each input's label, for example "Trade period Trade date", so custom start and end labels are kept. A top-level `aria-label` names the whole field, so the `FormField` label replaces it, matching `DateInputSingle`.
