---
"@salt-ds/lab": minor
---

Removed `ParentChildLayout` from labs and promote to core.

```tsx
export const Default = (): ReactElement => (
  <ParentChildLayout parent={parent} child={child} />
);
```
