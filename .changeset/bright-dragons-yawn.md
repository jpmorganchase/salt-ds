---
"@salt-ds/core": minor
---

Added `Menu`, `MenuItem`, `MenuTrigger`, `MenuPanel` and `MenuGroup`.

```tsx
<Menu>
  <MenuTrigger>
    <Button variant="secondary" aria-label="Open Menu">
      <MicroMenuIcon aria-hidden />
    </Button>
  </MenuTrigger>
  <MenuPanel>
    <MenuItem>Copy</MenuItem>
    <MenuItem>Paste</MenuItem>
    <MenuItem>Export</MenuItem>
    <MenuItem>Settings</MenuItem>
  </MenuPanel>
</Menu>
```
