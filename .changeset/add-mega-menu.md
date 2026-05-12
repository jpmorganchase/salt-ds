---
"@salt-ds/lab": minor
---

Added `MegaMenu`.

`MegaMenu` is a multi-column dropdown that opens from a trigger to display a large set of grouped navigation items. Use `MegaMenu` to manage open state, `MegaMenuTrigger` to toggle the panel, `MegaMenuPanel` for the floating container, and `MegaMenuSection` / `MegaMenuGroup` / `MegaMenuHeader` / `MegaMenuItem` / `MegaMenuItemContent` / `MegaMenuContent` to structure the contents.

```tsx
const [open, setOpen] = useState(false);

<MegaMenu open={open} onOpenChange={setOpen}>
  <MegaMenuTrigger>
    <NavigationItem>Solutions</NavigationItem>
  </MegaMenuTrigger>
  <MegaMenuPanel aria-label="Solutions menu">
    <MegaMenuSection>
      <MegaMenuGroup>
        <MegaMenuHeader>Financial services</MegaMenuHeader>
        <MegaMenuItem onClick={() => console.log("Digital banking")}>
          <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
        </MegaMenuItem>
        <MegaMenuItem onClick={() => console.log("Risk management")}>
          <MegaMenuItemContent>Risk management</MegaMenuItemContent>
        </MegaMenuItem>
      </MegaMenuGroup>
    </MegaMenuSection>
  </MegaMenuPanel>
</MegaMenu>;
```
