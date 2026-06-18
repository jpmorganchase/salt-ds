---
"@salt-ds/lab": minor
---

Reworked `MegaMenu` for more semantic, accessible markup and more predictable
keyboard navigation.

- **Renamed `MegaMenuHeader` to `MegaMenuGroupHeading`.** It now renders a real heading (`<h3>` by default; set the level with `as`, e.g. `as="h2"`) instead of a `<div>`, so each group appears in the document outline for assistive technology.
- **Renamed `MegaMenuItem` to `MegaMenuListItem`.** It renders an `<a>` by default — pass a `render` element such as `react-router`'s `Link` — and accepts a `current` prop that sets `aria-current="page"` for the active page.
- **Added `MegaMenuList`.** Wrap a group's items in it so they are announced as a list; `MegaMenuListItem` can no longer be placed directly inside `MegaMenuGroup`.
- **Renamed `MegaMenuSupportingContent` to `MegaMenuAside`.** It now renders an `<aside>` landmark, making the supporting region discoverable to screen-reader users.
- **Renamed `MegaMenuSupportingActions` to `MegaMenuActions`.**
- **Added `MegaMenuContent`.** It is the center navigation region holding the groups and an optional `MegaMenuActions` band; `MegaMenuAside` sits beside it, positioned by source order.
- **Narrowed `MegaMenu`'s `placement` prop** to `"bottom" | "bottom-start" | "bottom-end"` (the new `MegaMenuPlacement` type).
- **Menu columns now adapt to the available width** instead of overflowing, keeping panels usable on narrower viewports.
- **Keyboard navigation is more predictable** between the columns, the actions row, and the trigger;

```diff
  <MegaMenuPanel aria-label="Solutions menu">
+   <MegaMenuContent>
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
-     <MegaMenuSupportingActions>
+     <MegaMenuActions>
        <Link href="#demo">Book a demo</Link>
-     </MegaMenuSupportingActions>
+     </MegaMenuActions>
+   </MegaMenuContent>
-   <MegaMenuSupportingContent>...</MegaMenuSupportingContent>
+   <MegaMenuAside>...</MegaMenuAside>
  </MegaMenuPanel>
```
