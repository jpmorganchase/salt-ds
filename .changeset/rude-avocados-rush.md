---
"@salt-ds/core": patch
---

Made `status` prop optional in Tooltip, allowing for Tooltip to have no status.
The default for the `status` prop changed from `"info"` to `undefined`. Tooltips intended to have "info" status must refactor as below.

**Note:** This change is a bug fix but a breaking change for Tooltips that were intended to have "info" status, but did not explicitly set the `status` prop.

Before:

```tsx
<Tooltip>Information</Tooltip>
```

After:

```tsx
<Tooltip status="info">Information</Tooltip>
```
