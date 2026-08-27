---
"@salt-ds/core": minor
---

Added `DrawerHeader`, an implementation of the header block pattern for `Drawer`.

It supports `header`, `preheader`, `description` and `actions`, along with `status` and `disableAccent`, matching `DialogHeader`. `Drawer` now takes its accessible name from the header, so `aria-labelledby` no longer needs wiring by hand.

```tsx
<Drawer open={open} onOpenChange={setOpen} position="right">
  <DrawerHeader
    preheader="Settlements - Nostros"
    header="Cash breaks"
    description="LOB: Global Derivatives and Cash"
    actions={<DrawerCloseButton onClick={handleClose} />}
  />
</Drawer>
```
