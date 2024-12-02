---
"@salt-ds/date-adapters": minor
---

Split date adapters into sub packages to help with peerDependencies resolution

```diff
- import { AdapterDateFns } from "@salt-ds/date-adapters";
- import { AdapterDayjs } from "@salt-ds/date-adapters";
- import { AdapterLuxon } from "@salt-ds/date-adapters";
- import { AdapterMoment } from "@salt-ds/date-adapters";
+ import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
+ import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
+ import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
+ import { AdapterMoment } from "@salt-ds/date-adapters/moment";
```
