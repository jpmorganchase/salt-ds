---
"@salt-ds/core": minor
---

`SystemStatus` communicates essential platform-wide information, such as maintenance or outage alerts. These messages are displayed to be noticed immediately, prompting users to consider taking action based on four severity levels (with corresponding icons and colors): `info`, `success`, `warning` and `error`.

Compose it with `SystemStatusContent` and `SystemStatusActions`.

```tsx
<SystemStatus status="warning">
  <SystemStatusContent>
    We will be performing scheduled maintenance this weekend.
  </SystemStatusContent>
</SystemStatus>
```
 
