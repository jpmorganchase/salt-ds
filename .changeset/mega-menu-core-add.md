---
"@salt-ds/core": minor
---

`MegaMenu` is a large, expandable panel which opens from the main navigation. It displays and categorizes links to key application pages in a multi-column layout, allowing users to access a wide range of app features and content from a single menu.

Compose it with `MegaMenuTrigger`, `MegaMenuPanel`, `MegaMenuContent`, `MegaMenuAside`, `MegaMenuActions`, `MegaMenuGroups`, `MegaMenuGroup`, `MegaMenuGroupHeading`, `MegaMenuList`, and `MegaMenuListItem`.

```tsx
<MegaMenu>
  <MegaMenuTrigger>
    <NavigationItem>Products</NavigationItem>
  </MegaMenuTrigger>
  <MegaMenuPanel>
    <MegaMenuContent>
      <MegaMenuGroups>
        <MegaMenuGroup>
          <MegaMenuGroupHeading>Group</MegaMenuGroupHeading>
          <MegaMenuList>
            <MegaMenuListItem href="#">Item</MegaMenuListItem>
          </MegaMenuList>
        </MegaMenuGroup>
      </MegaMenuGroups>
    </MegaMenuContent>
  </MegaMenuPanel>
</MegaMenu>
```
