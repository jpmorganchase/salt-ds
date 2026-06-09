---
"@salt-ds/core": minor
---

Added `appearance` and `sentiment` props to `FileDropZoneTrigger`. `sentiment` accepts `'accented' | 'neutral'` (defaults to `'neutral'`) and `appearance` accepts `'solid' | 'bordered' | 'transparent'` (defaults to `'solid'`).

```tsx
<FileDropZoneTrigger appearance="bordered" sentiment="accented" />
```

Also widened the props type so all native `<button>` attributes (e.g. `type`, `name`, `form`, `value`) are now accepted.
