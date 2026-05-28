---
"@salt-ds/date-adapters": major
"@salt-ds/date-components": major
"@salt-ds/lab": major
---

`@salt-ds/date-components` and `@salt-ds/date-adapters` are now stable.

Date-related exports are no longer re-exported from `@salt-ds/lab`. Update imports for components and utilities such as `Calendar`, `DateInput`, `DatePicker`, and `LocalizationProvider` to `@salt-ds/date-components`. Continue importing adapters from `@salt-ds/date-adapters` subpaths such as `@salt-ds/date-adapters/luxon`.

```
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  DateInputSingle,
  type DateInputSingleProps,
  useLocalization,
} from "@salt-ds/date-components";
```
