---
"@salt-ds/lab": patch
---

Date components and related utilities have been extracted into a new package: `@salt-ds/date-components`. This package is intended to be the long-term home for these components.

To avoid a breaking change while the date components remain in release-candidate status, `@salt-ds/lab` continues to re-export the same APIs for now. Importing these APIs from `@salt-ds/lab` will emit a deprecation warning in development.

New code should import directly from `@salt-ds/date-components`. Once `@salt-ds/date-components` is marked stable, the date component exports will be removed from `@salt-ds/lab`.

In addition, `DatePickerSinglePanel` which was previously deprecated in favour of `DatePickerSingleGridPanel` has now been removed. Consumers should update to use `DatePickerSingleGridPanel` from `@salt-ds/date-components` if they have not already done so.

```diff
- import { DatePickerSinglePanel } from "@salt-ds/lab";
+ import { DatePickerSingleGridPanel } from "@salt-ds/date-components";
```
