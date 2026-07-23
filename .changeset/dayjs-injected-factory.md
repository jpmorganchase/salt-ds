---
"@salt-ds/date-adapters": patch
---

Fixed the Day.js adapter to consistently use an injected Day.js factory for timezone resolution, UTC/timezone date creation, `today`, and `now`.
