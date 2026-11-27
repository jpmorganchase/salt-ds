---
"@salt-ds/lab": minor
---

Promoted `SystemStatus`, `SystemStatusContent` and `SystemStatusActions` from lab to core. Import them from `@salt-ds/core` instead.

```diff
- import { SystemStatus, SystemStatusActions, SystemStatusContent } from "@salt-ds/lab";
+ import { SystemStatus, SystemStatusActions, SystemStatusContent } from "@salt-ds/core";
```
