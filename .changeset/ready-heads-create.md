---
"@salt-ds/date-components": patch
"@salt-ds/date-adapters": patch
---

`DateInputSingle` and `DateInputRange` a11y and dayjs timezone improvements

- added `aria-invalid` to `DateInputSingle` and `DateInputRange` input elements when an error is present.
- fixed Dayjs timezone handling for date input/picker workflows so that user-entered dates are correctly interpreted as midnight in the selected IANA timezone when serializing to ISO (e.g. `America/New_York`, `Asia/Shanghai`).
