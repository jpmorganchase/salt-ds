---
"@salt-ds/core": minor
---

Added a `resizable` prop to `Drawer`. When enabled, a resize handle is rendered on the drawer's inner edge for all four `position` values, allowing users to resize the drawer by dragging or with the keyboard. The handle occupies space inside the drawer's declared size rather than overlaying its content, so a drawer keeps the width or height you set while the space available to content is reduced by the handle's size. The drawer's own padding is preserved. Resize limits come from the drawer's own CSS: `min-width`/`max-width` for `left` and `right`, `min-height`/`max-height` for `top` and `bottom`.

```tsx
<Drawer
  resizable
  position="left"
  style={{ width: 320, minWidth: 200, maxWidth: 640 }}
>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```

The handle matches the Splitter (`@salt-ds/react-resizable-panels-theme`): a transparent strip with the same dot thumb, and the same hover, drag and focus treatments.

Borders are opt-in per side, as they are on the Splitter's handle, using `resizeHandleBorders`. Use `left` and `right` for a `left` or `right` drawer, and `top` and `bottom` for a `top` or `bottom` drawer; a side that does not run along the handle is ignored.

```tsx
<Drawer resizable position="left" resizeHandleBorders={["left"]}>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
