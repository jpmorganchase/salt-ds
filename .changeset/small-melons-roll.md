---
"@salt-ds/core": minor
---

Added `ListBox` component to core. `ListBox` allows the user to select an item from an array of options. Selected items are visually distinct from nonselected items. To ensure efficient space usage, long lists of items are in a scrolling pane that can provide access to options not immediately visible to the user.

```tsx
<ListBox>
  <Option value="red" />
  <Option value="orange" />
  <Option value="yellow" />
  <Option value="green" />
  <Option value="blue" />
  <Option value="indigo" />
  <Option value="violet" />
</ListBox>
```
