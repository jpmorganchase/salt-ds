---
"@salt-ds/lab": minor
---

Updated `MegaMenu` with a revised structure and API:

- **Renamed `MegaMenuHeader` to `MegaMenuGroupHeading`.** It now renders a semantic heading (`<h3>` by default, configurable with `level`) instead of a `<div>`.
- **Renamed `MegaMenuItem` to `MegaMenuListItem`.** It renders its own `<li>` wrapping the focusable action — an `<a>` by default, overridable with a `render` element (such as `react-router`'s `Link`). Its `ref` and DOM props target the `<li>`.
- **Added `MegaMenuList`.** Wrap a group's items in it (the `<ul>`); `MegaMenuListItem` can no longer be placed directly inside `MegaMenuGroup`.
- **Added `MegaMenuBody`.** It is the center navigation region, stacking `MegaMenuGroups` and an optional `MegaMenuSupportingActions` band beneath them. `MegaMenuSupportingContent` sits beside it, positioned by source order.

```diff
  <MegaMenuPanel aria-label="Solutions menu">
+   <MegaMenuBody>
      <MegaMenuGroups>
        <MegaMenuGroup>
-         <MegaMenuHeader>Financial services</MegaMenuHeader>
-         <MegaMenuItem render={<Link to="/digital-banking" />}>Digital banking</MegaMenuItem>
+         <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
+         <MegaMenuList>
+           <MegaMenuListItem render={<Link to="/digital-banking" />}>Digital banking</MegaMenuListItem>
+         </MegaMenuList>
        </MegaMenuGroup>
      </MegaMenuGroups>
      <MegaMenuSupportingActions>
        <Link href="#demo">Book a demo</Link>
      </MegaMenuSupportingActions>
+   </MegaMenuBody>
    <MegaMenuSupportingContent>...</MegaMenuSupportingContent>
  </MegaMenuPanel>
```
