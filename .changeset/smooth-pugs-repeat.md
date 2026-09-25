---
"@salt-ds/core": minor
---

Added a `resizable` prop to `Drawer`. When enabled, a resize handle is rendered on the drawer's inner edge for all four `position` values, allowing users to resize the drawer by dragging or with the keyboard. The handle occupies space inside the drawer's declared size rather than overlaying its content, so a drawer keeps the width or height you set while the space available to content is reduced by the handle's size. The drawer's own padding is preserved.

Resize limits are set with `minSize` and `maxSize`, and the size the drawer opens at with `defaultSize`. All three are in pixels, and apply to the width for a `left` or `right` drawer and to the height for a `top` or `bottom` drawer. `maxSize` defaults to the size of the viewport. Use `onResize` to persist the size the user chose.

A resizable drawer does not scroll itself, so compose it from `DrawerHeader`, `DrawerContent` and `DrawerFooter` and let `DrawerContent` scroll.

```tsx
<Drawer
  resizable
  position="left"
  defaultSize={320}
  minSize={200}
  maxSize={640}
  onResize={(size) => console.log(size)}
>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```

The handle matches the Splitter (`@salt-ds/react-resizable-panels-theme`): a transparent strip with the same dot thumb, and the same hover, drag and focus treatments.

The handle is reachable by keyboard. Arrow keys resize by a small step, `Shift` and an arrow key by a larger step, and `Home` and `End` jump to the minimum and maximum. Its accessible name defaults to "Resize drawer" and can be changed with `resizeHandleLabel`.

Borders are opt-in per side, as they are on the Splitter's handle, using `resizeHandleBorders`. Use `left` and `right` for a `left` or `right` drawer, and `top` and `bottom` for a `top` or `bottom` drawer; a side that does not run along the handle is ignored, and warns in development.

```tsx
<Drawer resizable position="left" resizeHandleBorders={["left"]}>
  <DrawerHeader header="Resizable drawer" />
  <DrawerContent>Content</DrawerContent>
</Drawer>
```
