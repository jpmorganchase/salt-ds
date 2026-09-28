---
"@salt-ds/core": minor
---

Added `resizable`, `size`, `onResize` and `onResizeEnd` props to `Drawer`. A resizable drawer has a handle that users can drag with mouse cursor or move with the arrow keys. Set its initial size and limits with CSS (`width`, `min-width`, `max-width`, or their height equivalents for `top` and `bottom` drawers). To control the size, use `size` with `onResize`.

```tsx
<Drawer
  resizable
  size={width}
  onResize={(_event, size) => setWidth(size)}
  style={{ minWidth: 200, maxWidth: 640 }}
>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
