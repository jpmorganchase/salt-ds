---
"@salt-ds/lab": minor
---

Updated `MegaMenu` with a revised component structure and API.

The panel is now a single horizontal row — `[Aside | Main | Aside]` — whose only
direct children are `MegaMenuAside` (side content) and a single `MegaMenuMain`
(the navigation area). `MegaMenuMain` lays its `MegaMenuSection` columns out and
renders an optional `MegaMenuFooter` beneath them. Position is derived from
component type and source order alone — there are no placement props.

- **Added `MegaMenuMain`**, the center navigation area. It holds the
  `MegaMenuSection` columns and the optional `MegaMenuFooter`, and absorbs the
  removed `MegaMenuGroups`. The CSS custom property for column width is
  `--saltMegaMenuMain-columnWidth`.
- **Removed `MegaMenuGroups`.** Wrap sections in `MegaMenuMain` instead.
- **Renamed `MegaMenuGroup` to `MegaMenuSection`** — one category column
  (heading + links).
- **Renamed `MegaMenuHeader` to `MegaMenuHeading`** — a section's label.
- **Renamed `MegaMenuItem` to `MegaMenuLink`** — the single focusable link, with
  Space-activation parity and closing the menu on click. It keeps the `render`
  prop for custom link/routing components (such as `react-router`'s `Link`).
- **Renamed `MegaMenuRegion` to `MegaMenuAside`** for side content. It renders to
  the left of `MegaMenuMain` when placed before it, and to the right when placed
  after.
- **Renamed `MegaMenuBand` to `MegaMenuFooter`** for full-width content. The
  footer now lives **inside `MegaMenuMain`** and is **bottom-only**, width-bound
  to the columns above it — there is no top band.

```diff
  <MegaMenuPanel aria-label="Solutions menu">
+   <MegaMenuMain>
-     <MegaMenuGroups>
-       <MegaMenuGroup>
-         <MegaMenuHeader>Financial services</MegaMenuHeader>
-         <MegaMenuItem render={<Link to="/digital-banking" />}>
+       <MegaMenuSection>
+         <MegaMenuHeading>Financial services</MegaMenuHeading>
+         <MegaMenuLink render={<Link to="/digital-banking" />}>
            <Icon aria-hidden />
            Digital banking
-         </MegaMenuItem>
-       </MegaMenuGroup>
-     </MegaMenuGroups>
+         </MegaMenuLink>
+       </MegaMenuSection>
-     <MegaMenuBand>
+       <MegaMenuFooter>
          <Link href="#demo" IconComponent={ChevronRightIcon}>Book a demo</Link>
-     </MegaMenuBand>
+       </MegaMenuFooter>
+   </MegaMenuMain>
-   <MegaMenuRegion>...</MegaMenuRegion>
+   <MegaMenuAside>...</MegaMenuAside>
  </MegaMenuPanel>
```
