---
"@salt-ds/core": minor
---

Added `DrawerHeader` and `DrawerContent`, implementing header block in core `Drawer`. Composing a `Drawer` from `DrawerHeader` and `DrawerContent` is the recommended approach.

`DrawerHeader` takes optional `header`, `preheader`, `description` and `actions`, and displays an accent bar unless `disableAccent` is set. `DrawerCloseButton` should be passed to `actions`. `DrawerHeader` stays pinned to the top, `DrawerContent` is scrollable.

`DrawerHeader` names `Drawer` with its `header` and `preheader`, and describes it with its `description`, so `aria-labelledby` and `aria-describedby` no longer need to be set manually.

`DrawerCloseButton` is no longer positioned with `position: fixed`. Drawers that place it directly inside `Drawer`, rather than in the `actions` of `DrawerHeader`, will see it move into the normal content flow.

```tsx
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@salt-ds/core";

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerHeader
    header="Check deposit #1278"
    actions={<DrawerCloseButton onClick={() => setOpen(false)} />}
  />
  <DrawerContent>{content}</DrawerContent>
</Drawer>;
```
