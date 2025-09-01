---
"@salt-ds/core": minor
---

Added `Collapsible` and related components.

`Collapsible` enables content to be either collapsed (hidden) or expanded (visible). It has two elements: a trigger and a panel whose visibility is controlled by the button.

```tsx
<Collapsible>
  <CollapsibleTrigger>
    <Button>Click</Button>
  </CollapsibleTrigger>
  <CollapsiblePanel>
    <p>Content</p>
  </CollapsiblePanel>
</Collapsible>
```
