---
"@salt-ds/core": minor
---

Added `DrawerHeader` and `DrawerContent`, implementing header block in core `Drawer`. `DrawerHeader` takes optional `header`, `preheader`, `description` and `actions`, and displays an accent bar unless `disableAccent` is set. Heading names the drawer, so `aria-labelledby` no longer needs to be set manually. `DrawerHeader` stays pinned to the top, `DrawerContent` is scrollable. Drawers without a `DrawerHeader` are unchanged.

```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerHeader header="Check deposit #1278" actions={closeButton} />
  <DrawerContent>{content}</DrawerContent>
</Drawer>
```
