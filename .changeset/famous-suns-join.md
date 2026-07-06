---
"@salt-ds/core": minor
---

Added a `represents` prop to `Avatar` to distinguish usage by what the Avatar represents.

- `represents="person"` (default) renders a circular Avatar.
- `represents="business"` renders a square Avatar.

```tsx
<Avatar name="John Doe" />
<Avatar represents="business" name="JPMC" />
```
