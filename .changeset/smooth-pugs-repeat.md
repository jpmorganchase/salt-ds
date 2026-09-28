---
"@salt-ds/core": minor
---

Added `resizable` and `onResizeStop` props to `Drawer`. A resizable drawer shows a resize handle on its inner edge that can be dragged or moved with the keyboard.

- The drawer's `width` (`left`, `right`) or `height` (`top`, `bottom`) style sets its initial size.
- Limits come from `min-width`/`max-width` or `min-height`/`max-height`, or the `--saltDrawer-minSize` and `--saltDrawer-maxSize` CSS variables. The drawer never shrinks below `--salt-size-base`, and the maximum is `100%`.
- `onResizeStop` is called with the new size in px when the user finishes resizing.

```tsx
<Drawer
  resizable
  position="left"
  style={{ width: 320, minWidth: 200, maxWidth: 640 }}
  onResizeStop={(event, size) => saveWidth(size)}
>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
