---
"@salt-ds/core": minor
---

Added `DrawerHeader`, `DrawerContent` and `DrawerActions`, implementing header block in core `Drawer`. Composing a `Drawer` from `DrawerHeader` and `DrawerContent` is the recommended approach.

`DrawerHeader` takes optional `header`, `preheader`, `description` and `actions`, and displays an accent bar unless `disableAccent` is set. `DrawerCloseButton` should be passed to `actions`. `DrawerHeader` stays pinned to the top, `DrawerContent` is scrollable.

`DrawerHeader` names `Drawer` with its `header` and `preheader`, and describes it with its `description`, so `aria-labelledby` and `aria-describedby` no longer need to be set manually.

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
  <DrawerActions>
    <Button appearance="transparent">Cancel</Button>
    <Button sentiment="accented">Save</Button>
  </DrawerActions>
</Drawer>;
```
