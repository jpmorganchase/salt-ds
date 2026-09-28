---
"@salt-ds/core": minor
---

Added `resizable` and `onResizeStop` props to `Drawer`. A resizable drawer can be resized from its inner edge by dragging or with the keyboard, within its `min-width`/`max-width` (or `min-height`/`max-height`), which can also be set with `--saltDrawer-minWidth`, `--saltDrawer-maxWidth`, `--saltDrawer-minHeight` and `--saltDrawer-maxHeight`.

```tsx
<Drawer
  resizable
  style={{ width: 320, minWidth: 200, maxWidth: 640 }}
  onResizeStop={(event, size) => saveWidth(size)}
>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
