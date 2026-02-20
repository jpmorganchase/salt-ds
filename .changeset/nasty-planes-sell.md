---
"@salt-ds/core": minor
---

- `AriaAnnouncer` improvements, previously `delay` was used to queue announcements, but it could create overlapping announcements. We have deprecated `delay`, although it is still supported. Instead, we have added a new options API.
- `duration`: provides a sequential delay between announcements, ensuring they do not overlap.
- `ariaLive` determines the importance and urgency of the announcement.

The default duration is 500 msecs, unless specified.

```diff
import { useAriaAnnouncer } from "./useAriaAnnouncer";

const { announce } = useuseAriaAnnouncer();

- const delayMsec = 1000;
- announce("my announcement", delayMsec);
+ announce("my announcement", { duration: 1000, ariaLive: "polite"});
```
