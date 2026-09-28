---
"@salt-ds/core": minor
---

Added `resizable`, `size`, `onResize` and `onResizeEnd` props to `Drawer`. A resizable drawer has a handle that users can drag with mouse cursor or move with the arrow keys. Set its initial size with CSS `width` (`height` for `top` and `bottom` drawers), and its limits with the `--saltDrawer-minWidth`/`--saltDrawer-maxWidth` variables (`--saltDrawer-minHeight`/`--saltDrawer-maxHeight` for `top` and `bottom` drawers). To control the size, use `size` with `onResize`.

```tsx
<Drawer
  resizable
  size={width}
  onResize={(_event, size) => setWidth(size)}
  style={{ "--saltDrawer-minWidth": "200px", "--saltDrawer-maxWidth": "640px" }}
>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
