---
"@salt-ds/core": minor
---

Added resizing to `Drawer`. With `resizable`, users can drag the drawer's edge, or use the arrow keys, to adjust its size. Set size limits with the `--saltDrawer-minWidth` and `--saltDrawer-maxWidth` CSS variables. Use `size` and `onResize` to control the size, or `onResizeEnd` to save the user's preferred size.

```tsx
<Drawer resizable style={{ width: 320 }}>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
