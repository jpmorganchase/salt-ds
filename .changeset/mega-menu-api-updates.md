---
"@salt-ds/lab": minor
---

Updated `MegaMenu` with a revised structure and API:

- **Renamed `MegaMenuHeader` to `MegaMenuGroupHeading`.** It now renders a semantic heading (`<h3>` by default, configurable with `level`) instead of a `<div>`.
- **Renamed `MegaMenuItem` to `MegaMenuListItem`.** It renders its own `<li>` wrapping the focusable action — an `<a>` by default, overridable with a `render` element (such as `react-router`'s `Link`). Its `ref` and DOM props target the `<li>`.
- **Added `MegaMenuList`.** Wrap a group's items in it (the `<ul>`); `MegaMenuListItem` can no longer be placed directly inside `MegaMenuGroup`.
- **Added `MegaMenuBody`.** It is the center navigation region, stacking `MegaMenuGroups` and an optional `MegaMenuSupportingActions` band beneath them. `MegaMenuSupportingContent` sits beside it, positioned by source order.
- **Reworked keyboard navigation.** The panel's navigation engine was rewritten, with these changes from the previous behaviour:
  - `ArrowUp` at the top of a column now returns focus to the trigger, instead of wrapping to the previous column.
  - `ArrowRight` on the rightmost column now exits to the next trigger (closing the menu) only from the last item, and otherwise returns focus to the trigger with the menu kept open.
  - `MegaMenuSupportingActions` now navigates as a horizontal row (`ArrowLeft`/`ArrowRight` within it, `ArrowUp` back to the last column), rather than as a vertical column.
  - `Shift+Tab` on an open trigger now closes the menu.

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
