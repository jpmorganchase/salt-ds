---
"@salt-ds/core": minor
---

Added a `kind` prop to `Avatar` to distinguish usage by what the Avatar represents.

- `kind="person"` (default) renders a circular Avatar.
- `kind="entity"` renders a square Avatar.

```tsx
<Avatar name="John Doe" />
<Avatar kind="entity" name="JPMC" />
```
