---
"@salt-ds/core": minor
---

Added `VerticalNavigation` and related components.

`VerticalNavigation` has been introduced to replace the existing `NavigationItem` component for vertical navigation. The new component provides a more structured and flexible way to create vertical navigation. For now you can continue to use the `NavigationItem` component, but we recommend migrating to the new `VerticalNavigation` component as the `NavigationItem` component will be deprecated in a future release and removed in the future major release.

```tsx
<VerticalNavigation aria-label="Basic sidebar" appearance="indicator">
  <VerticalNavigationItem active>
    <VerticalNavigationItemContent>
      <VerticalNavigationItemTrigger>
        <VerticalNavigationItemLabel>Item 1</VerticalNavigationItemLabel>
      </VerticalNavigationItemTrigger>
    </VerticalNavigationItemContent>
  </VerticalNavigationItem>
</VerticalNavigation>
```
