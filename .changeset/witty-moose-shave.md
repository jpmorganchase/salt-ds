---
"@salt-ds/lab": minor
---

Added `Collapsible`, `CollapsibleTrigger` and `CollapsiblePanel`.

Collapsible enables content to be either collapsed (hidden) or expanded (visible). It has two elements: a trigger and a panel whose visibility is controlled by the button.

```tsx
<Collapsible>
  <CollapsibleTrigger>
    <Button>Click</Button>
  </CollapsibleTrigger>
  <CollapsiblePanel>Content</CollapsiblePanel>
</Collapsible>
```
