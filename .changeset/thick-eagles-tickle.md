---
"@salt-ds/core": minor
---

Added `DrawerHeader`, `DrawerContent` and `DrawerActions`, implementing header block in core `Drawer`. `DrawerHeader` takes optional `header`, `preheader`, `description` and `actions`, and displays an accent bar unless `disableAccent` is set. `header` prop from `DrawerHeader` names `Drawer` and `description` prop from `DrawerHeader` describes `Drawer`, so `aria-labelledby` and `aria-describedby` no longer need to be set manually. `DrawerCloseButton` should be passed to `actions`. `DrawerHeader` stays pinned to the top, `DrawerContent` is scrollable and `DrawerActions` stays pinned to the bottom. Drawers without `DrawerHeader` and `DrawerContent` are deprecated.

```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerHeader header="Check deposit #1278" actions={closeButton} />
  <DrawerContent>{content}</DrawerContent>
  <DrawerActions>
    <Button appearance="transparent">Cancel</Button>
    <Button sentiment="accented">Save</Button>
  </DrawerActions>
</Drawer>
```
