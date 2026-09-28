---
"@salt-ds/core": minor
---

Added `resizable` and `onResizeFinish` props to `Drawer`. A resizable drawer has a handle that users can drag with mouse cursor or move with the arrow keys. Set its size limits with CSS (`min-width`/`max-width`, or `min-height`/`max-height` for `top` and `bottom` drawers).

```tsx
<Drawer
  resizable
  style={{ width, minWidth: 200, maxWidth: 640 }}
  onResizeFinish={(_event, size) => setWidth(size)}
>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
