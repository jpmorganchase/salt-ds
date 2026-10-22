---
"@salt-ds/core": minor
---

Added resizing to `Drawer`. With `resizable`, users can drag the drawer's edge, click the edge and then click its new position, or use the arrow keys to adjust its size. Set size limits with the `--saltDrawer-minWidth` and `--saltDrawer-maxWidth` CSS variables.

```tsx
<Drawer resizable style={{ width: 320 }}>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
