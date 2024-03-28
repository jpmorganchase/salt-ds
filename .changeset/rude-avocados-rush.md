---
"@salt-ds/core": patch
---

Made `status` prop optional in Tooltip, allowing for Tooltip to have no status.
The default for the `status` prop changed from `"info"` to `undefined`. Tooltips intended to have "info" status must refactor as below.

Before:

```tsx
<Tooltip>Information</Tooltip>
```

After:

```tsx
<Tooltip status="info">Information</Tooltip>
```
