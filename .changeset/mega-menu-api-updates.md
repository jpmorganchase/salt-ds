---
"@salt-ds/lab": minor
---

Updated `MegaMenu` with several API improvements:

- **Renamed `MegaMenuSection` to `MegaMenuGroups`.** The associated CSS custom property `--saltMegaMenuSection-columnWidth` has been renamed to `--saltMegaMenuGroups-columnWidth`.
- **Removed `MegaMenuItemContent`.** Pass the label directly to `MegaMenuItem`.
- **Added a `render` prop to `MegaMenuItem`** for integration with custom link or routing components (such as `react-router`'s `Link`). `MegaMenuItem` is now the single focusable link, with Space-activation parity and closing the menu on click.
- **Removed `MegaMenuSupportingContent` and `MegaMenuSupportingActions`.** Use `MegaMenuRegion` and `MegaMenuBand` instead.
- **Added `MegaMenuRegion`** for side content. It renders to the left of `MegaMenuGroups` when placed before it in the panel, and to the right when placed after.
- **Added `MegaMenuBand`** for full-width content. It renders as a band on top when placed before `MegaMenuGroups`, and on the bottom when placed after.

`MegaMenuPanel` now owns a CSS grid that positions its children from their type and source order alone — a `MegaMenuGroups` in the center, `MegaMenuRegion`s to the sides and `MegaMenuBand`s top/bottom — so authors no longer need wrapper `<div>`/`FlexLayout` scaffolding to lay out a panel.

```diff
- <MegaMenuSection>
+ <MegaMenuGroups>
    <MegaMenuGroup>
      <MegaMenuHeader>Financial services</MegaMenuHeader>
-     <MegaMenuItem>
-       <Icon aria-hidden />
-       <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
-     </MegaMenuItem>
+     <MegaMenuItem render={<Link to="/digital-banking" />}>
+       <Icon aria-hidden />
+       Digital banking
+     </MegaMenuItem>
    </MegaMenuGroup>
- </MegaMenuSection>
+ </MegaMenuGroups>
- <MegaMenuContent>...</MegaMenuContent>
+ <MegaMenuRegion>...</MegaMenuRegion>
- <MegaMenuSupportingActions>
-   <Link href="#demo" IconComponent={ChevronRightIcon}>Book a demo</Link>
- </MegaMenuSupportingActions>
+ <MegaMenuBand>
+   <Link href="#demo" IconComponent={ChevronRightIcon}>Book a demo</Link>
+ </MegaMenuBand>
```
