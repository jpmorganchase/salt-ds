---
"@salt-ds/lab": minor
---

Submenu's now persist when the cursor moves from the menu to the body. This makes it easier to interact with submenus.
Added `getVirtualElement` to Menu. To allow positioning Menu's relative to a custom reference area. This can be used to create a context menu.

```tsx
<Menu
  getVirtualElement={() => ({
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }),
  })}
>
  <MenuPanel>
    <MenuItem>Copy</MenuItem>
    <MenuItem>Move</MenuItem>
    <MenuItem>Delete</MenuItem>
  </MenuPanel>
</Menu>
```
