---
"@salt-ds/core": major
---

Made `status` prop optional in Tooltip. Prop default changed from `"info"` to `undefined`, causing the default Tooltip to have status-less styling.

Before:

```tsx
<Tooltip>Information</Tooltip>
```

After:

```tsx
<Tooltip status="info">Information</Tooltip>
```
