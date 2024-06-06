---
"@salt-ds/lab": minor
---

Added `visibleMonths` to date picker, it renders a single calendar for a range selection when `visibleMonths` prop is 1. It's recommended using it when the space is limited.

```tsx
<DatePicker selectionVariant="range" visibleMonths={1} />
```
