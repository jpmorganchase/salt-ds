---
"@salt-ds/date-adapters": major
"@salt-ds/date-components": major
"@salt-ds/lab": minor
---

Date components and related utilities are now stable in `@salt-ds/date-components` and `@salt-ds/date-adapters`.

New code should import directly from `@salt-ds/date-components` and `@salt-ds/date-adapters`, date component exports have been removed from `@salt-ds/lab`.

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
