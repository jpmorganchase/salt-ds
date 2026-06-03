---
"@salt-ds/lab": minor
---

Updated `MegaMenu` with several API improvements:

- **Renamed `MegaMenuSection` to `MegaMenuGroups`.** The associated CSS custom property `--saltMegaMenuSection-columnWidth` has been renamed to `--saltMegaMenuGroups-columnWidth`.
- **Renamed `MegaMenuContent` to `MegaMenuSupportingContent`** to better convey its purpose as a region for supporting content alongside the menu groups.
- **Removed `MegaMenuItemContent`.** Pass the label directly to `MegaMenuItem`.
- **Added `MegaMenuSupportingActions`.** Use it to group one or more supporting action links beneath the menu groups in a `MegaMenuPanel`.
- **Added a `render` prop to `MegaMenuItem`** for integration with custom link or routing components (such as `react-router`'s `Link`).

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
+ <MegaMenuSupportingContent>...</MegaMenuSupportingContent>
+ <MegaMenuSupportingActions>
+   <Link href="#demo" IconComponent={ChevronRightIcon}>Book a demo</Link>
+ </MegaMenuSupportingActions>
```
