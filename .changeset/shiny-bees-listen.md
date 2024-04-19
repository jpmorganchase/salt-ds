---
"@salt-ds/core": minor
---

Added support for passing a string gap values to FlexLayout and GridLayout.

```tsx
<FlexLayout gap="spacing-100" />
<GridLayout gap="spacing-100" rowGap="spacing-100" columnGap="spacing-100" />
```

Added support for passing a string column and row template to GridLayout.

```tsx
<GridLayout columns="1fr 1fr 2fr" rows="1fr 2fr" />
```
