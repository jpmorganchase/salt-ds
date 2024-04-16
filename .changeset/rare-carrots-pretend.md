---
"@salt-ds/core": minor
---

Promoted `ParentChildLayout` from labs to core.

```tsx
const parent = <div>Parent</div>;

const child = <di>Child</div>;

export const Default = (): ReactElement => (
  <ParentChildLayout parent={parent} child={child} />
);
```
