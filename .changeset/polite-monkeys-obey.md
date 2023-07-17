---
"@salt-ds/core": minor
---

Add ToggleButton and ToggleButtonGroup.

The Toggle Button Group allows users to make a mutually exclusive selection from a set of related commands—with only one option selected at a time.
This Toggle Button allows users to enable or disable a single command.

```tsx
<ToggleButtonGroup>
  <ToggleButton value="all">
    <AppSwitcherIcon aria-hidden />
    All
  </ToggleButton>
  <ToggleButton value="active">
    <VisibleIcon aria-hidden />
    Active
  </ToggleButton>
  <ToggleButton disabled value="search">
    <FolderClosedIcon aria-hidden />
    Archived
  </ToggleButton>
</ToggleButtonGroup>
```
