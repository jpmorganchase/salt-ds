---
"@salt-ds/core": patch
---

Added a `represents` prop to `Avatar` to distinguish usage by what the Avatar represents rather than by shape.

- `represents="person"` (default) renders a circular Avatar and falls back to `UserIcon` — matching the existing behavior, so there is no breaking change.
- `represents="business"` renders a square Avatar and falls back to `BankIcon`.

```tsx
<Avatar name="Alex Brailescu" />
<Avatar represents="business" name="Blackrock" />
```
