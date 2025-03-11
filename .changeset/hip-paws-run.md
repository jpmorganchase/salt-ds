---
"@salt-ds/core": minor
"@salt-ds/lab": minor
---

Added `Splitter` component to core. `Splitter` divides window content into separate regions called `SplitPanel`s that can be dragged and resized, allowing users to customize the layout of their workspace.

```tsx
import { Splitter, SplitPanel, SplitHandle, Text } from "@salt-ds/core";

function Example() {
  return (
    <Splitter orientation="horizontal">
      <SplitPanel id="top">
        <Text>Top</Text>
      </SplitPanel>
      <SplitHandle aria-label="Resize Top/Center" />
      <SplitPanel id="center">
        <Text>Center</Text>
      </SplitPanel>
      <SplitHandle aria-label="Resize Center/Bottom" />
      <SplitPanel id="bottom">
        <Text>Bottom</Text>
      </SplitPanel>
    </Splitter>
  );
}
```
