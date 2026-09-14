---
"@salt-ds/core": minor
---

Added `DrawerHeader`, `DrawerContent` and `DrawerFooter`, implementing header and footer blocks in core `Drawer`. Composing a `Drawer` from `DrawerHeader`, `DrawerContent` and `DrawerFooter` is the recommended approach.

`DrawerHeader` takes optional `header`, `preheader`, `description` and `actions`, and displays an accent bar unless `disableAccent` is set. A close action should be passed to `actions` as a `Button`. `DrawerHeader` stays pinned to the top, `DrawerContent` is scrollable.

`DrawerHeader` names `Drawer` with its `header` and `preheader`, and describes it with its `description`, so `aria-labelledby` and `aria-describedby` no longer need to be set manually.

```tsx
import { Button, Drawer, DrawerContent, DrawerFooter, DrawerHeader } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerHeader
    header="Check deposit #1278"
    actions={
      <Button
        aria-label="Close drawer"
        appearance="transparent"
        onClick={() => setOpen(false)}
      >
        <CloseIcon aria-hidden />
      </Button>
    }
  />
  <DrawerContent>{content}</DrawerContent>
  <DrawerFooter>
    <Button appearance="transparent">Cancel</Button>
    <Button sentiment="accented">Save</Button>
  </DrawerFooter>
</Drawer>;
```

Deprecated `DrawerCloseButton`. Use a `Button` with a `CloseIcon` in `DrawerHeader`'s `actions` instead.
