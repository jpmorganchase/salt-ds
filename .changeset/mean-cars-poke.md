---
"@salt-ds/core": minor
---

Added `Toolbar`, `ToolbarContent`, and `Tooltray` for composing horizontal toolbars with responsive overflow, grouped controls, and keyboard navigation.

Renamed from `ToolbarNext`, `ToolbarContentNext`, and `TooltrayNext` in lab.

**Basic Toolbar** — place `Tooltray` components directly inside `Toolbar`; use `align="end"` for trailing actions

```tsx
import { Toolbar, Tooltray } from "@salt-ds/core";

<Toolbar aria-label="Data controls">
  <Tooltray>{/* controls */}</Tooltray>
  <Tooltray align="end" role="group" aria-label="View and actions">
    {/* controls */}
  </Tooltray>
</Toolbar>;
```

**Centered Toolbar With Named Overflow** — use `ToolbarContent` when you need explicit start, center, and end regions

```tsx
import { ToolbarContent, Toolbar, Tooltray } from "@salt-ds/core";

<Toolbar aria-label="Centered actions">
  <ToolbarContent position="start">
    <Tooltray overflowGroup="filters" overflowLabel="Filters">
      {/* controls */}
    </Tooltray>
  </ToolbarContent>
  <ToolbarContent position="center">
    <Tooltray overflowMode="none" role="group" aria-label="View options">
      {/* controls */}
    </Tooltray>
  </ToolbarContent>
  <ToolbarContent position="end">
    <Tooltray align="end">{/* controls */}</Tooltray>
  </ToolbarContent>
</Toolbar>;
```
