---
"@salt-ds/core": minor
---

Updates default padding for Card to `--salt-spacing-200`.

```diff
- padding: var(--saltCard-padding, var(--salt-spacing-300));
+ padding: var(--saltCard-padding, var(--salt-spacing-200));
```

Adds `accent` and `hoverable` props to Card.

`accent` prop enables positioning of an optional accent.
`hoverable` prop enables hover styling.

```tsx
<Card accent="top" hoverable>
  {children}
</Card>
```
