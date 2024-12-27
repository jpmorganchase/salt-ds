---
"@salt-ds/date-adapters": patch
"@salt-ds/lab": patch
---

Refine peer dependency management for DatePicker adapters by splitting them into sub-packages. You now import only the specific date framework adapter you need, simplifying dependency handling.

- **For `date-fns`:**

  ```diff
  - import { AdapterDateFns } from "@salt-ds/date-adapters";
  + import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
  ```

- **For `dayjs`:**

  ```diff
  - import { AdapterDayjs } from "@salt-ds/date-adapters";
  + import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
  ```

- **For `luxon`:**

  ```diff
  - import { AdapterLuxon } from "@salt-ds/date-adapters";
  + import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
  ```

- **For `moment`:**

  ```diff
  - import { AdapterMoment } from "@salt-ds/date-adapters";
  + import { AdapterMoment } from "@salt-ds/date-adapters/moment";
  ```

Additionally, `DateDetailErrorEnum` is now a simpler `DateDetailError` of type `DateDetailErrorType`.

```diff
- import { DateDetailErrorEnum } from "@salt-ds/date-adapters";
+ import { DateDetailError } from "@salt-ds/date-adapters/moment";
```

### Instructions

1. Modify your import statements to use the specific sub-package for the date adapter you require.

2. Ensure your `package.json` includes the necessary date framework as a dependency. For example, if using `date-fns`:

   ```json
   {
     "dependencies": {
       "date-fns": "^x.x.x"
     }
   }
   ```

This change helps streamline the integration of date frameworks with the DatePicker component by ensuring only the necessary adapters and dependencies are included.
