---
"@salt-ds/core": patch
---

Made `status` prop optional in Toast, allowing for Toast to have no status.
The default for the `status` prop changed from `"info"` to `undefined`. Toasts intended to have "info" status must refactor as beflow.

**Note:** This change is a bug fix but a breaking change for Toasts that were intended to have "info" status, but did not explicitly set the `status` prop.

Before:

```tsx
<Toast>
  <ToastContent>
    A new version of this file is available with 37 updates.
  </ToastContent>
</Toast>
```

After:

```tsx
<Toast status="info">
  <ToastContent>
    A new version of this file is available with 37 updates.
  </ToastContent>
</Toast>
```
