---
"@salt-ds/lab": minor
---

## Summary

New `ToolbarNext`, `ToolbarContent`, and `TooltrayNext` components for composing horizontal toolbars with responsive overflow, grouped controls, and keyboard navigation.

**What's included**

- Flat authoring with `TooltrayNext` children aligned to start, center, or end
- Explicit `ToolbarContent` regions for start, center, and end toolbar layouts
- Shared, named, grouped, independent, and non-overflowing tooltray overflow modes
- Overflow priority control for deciding which trays collapse first
- Bordered and transparent appearances with primary, secondary, and tertiary variants
- Horizontal toolbar semantics and keyboard navigation across toolbar controls and overflow menus
- `TooltrayNext` as a layout-only wrapper, with optional `role="group"` and accessible labels for meaningful control groups

## Examples

**Basic Toolbar** — place `TooltrayNext` components directly inside `ToolbarNext`; use `align="end"` for trailing actions

```tsx
import { Button, Dropdown, Input, Option } from "@salt-ds/core";
import { GridIcon, ListIcon, SearchIcon } from "@salt-ds/icons";
import { ToolbarNext, TooltrayNext } from "@salt-ds/lab";

const options = ["Option A", "Option B", "Option C"];

<ToolbarNext aria-label="Data controls">
  <TooltrayNext>
    <Dropdown bordered defaultSelected={["Option A"]} style={{ width: 160 }}>
      {options.map((option) => (
        <Option value={option} key={option} />
      ))}
    </Dropdown>
  </TooltrayNext>
  <TooltrayNext role="group" aria-label="Search">
    <Input
      bordered
      startAdornment={<SearchIcon />}
      placeholder="Search"
      style={{ width: 180 }}
    />
  </TooltrayNext>
  <TooltrayNext align="end" role="group" aria-label="View and actions">
    <Button appearance="transparent" aria-label="Grid view">
      <GridIcon aria-hidden />
    </Button>
    <Button appearance="transparent" aria-label="List view">
      <ListIcon aria-hidden />
    </Button>
    <Button appearance="solid">Run</Button>
  </TooltrayNext>
</ToolbarNext>;
```

**Centered Toolbar With Named Overflow** — use `ToolbarContent` when you need explicit start, center, and end regions; named overflow keeps related actions behind a labelled trigger

```tsx
import { Button, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { ToolbarContent, ToolbarNext, TooltrayNext } from "@salt-ds/lab";

<ToolbarNext aria-label="Centered actions">
  <ToolbarContent position="start">
    <TooltrayNext overflowMode="none" role="group" aria-label="Primary action">
      <Button appearance="solid">Create</Button>
    </TooltrayNext>
  </ToolbarContent>
  <ToolbarContent position="center">
    <TooltrayNext overflowMode="none" role="group" aria-label="View options">
      <ToggleButtonGroup>
        <ToggleButton value="day">Day</ToggleButton>
        <ToggleButton value="week">Week</ToggleButton>
        <ToggleButton value="month">Month</ToggleButton>
      </ToggleButtonGroup>
    </TooltrayNext>
  </ToolbarContent>
  <ToolbarContent position="end">
    <TooltrayNext
      overflowGroup="Actions"
      overflowLabel="Actions"
      overflowMode="grouped"
      overflowPriority={5}
      role="group"
      aria-label="Secondary actions"
    >
      <Button appearance="transparent">Export</Button>
      <Button appearance="transparent">Settings</Button>
    </TooltrayNext>
  </ToolbarContent>
</ToolbarNext>;
```
