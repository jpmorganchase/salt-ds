---
"@salt-ds/lab": minor
---

Removed `SegmentedButtonGroup` from labs and promoted to core
`SegmentedButtonGroup` shows a list of actionable buttons, flush with separators between them.

```tsx
return (
  <SegmentedButtonGroup>
    <Button variant={variant}>Button</Button>
    <Button variant={variant}>Button</Button>
    <Button variant={variant}>Button</Button>
  </SegmentedButtonGroup>
);
```
