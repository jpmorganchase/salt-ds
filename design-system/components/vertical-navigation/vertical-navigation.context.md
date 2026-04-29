# Vertical Navigation (Copilot Context)

Use source-of-truth links before generating implementation guidance.

- API: ./vertical-navigation.json
- Guidance: ./vertical-navigation.md
- Preference: Collapsible with VerticalNavigationSubMenu for hierarchical navigation

## Key rules

- **Subcomponent composition**: Always import VerticalNavigationItem, VerticalNavigationItemContent, VerticalNavigationItemLabel, and VerticalNavigationItemTrigger.
- **Active state**: Use `active` prop on VerticalNavigationItem to mark current page in navigation hierarchy.
- **Routing integration**: Use `render` prop on VerticalNavigationItemTrigger to supply routing library Link (React Router, Next.js) for client-side navigation.
- **Nested items**: Wrap nested children in VerticalNavigationSubMenu inside VerticalNavigationItem.
- **Collapsible behavior**: Pair VerticalNavigationSubMenu with Collapsible/CollapsibleTrigger for expand/collapse; preserve parent active state when child is active.
- **Accessible naming**: Apply aria-label or aria-labelledby to VerticalNavigation root; use aria-current='page' for current page item.
- **Appearance default**: Use appearance='bordered' (default) unless design calls for appearance='indicator' (minimal accent style).
- **Icon consistency**: When adding icons, use consistently across same hierarchy level; apply aria-hidden.
- **Container spacing**: If VerticalNavigation is placed inside a wrapper container, set the wrapper `padding-left` to `0`. If inside a drawer, apply `var(--salt-spacing-300)` padding to the drawer on all sides.

## Example (flat structure)

```tsx
import { VerticalNavigation, VerticalNavigationItem, VerticalNavigationItemContent, VerticalNavigationItemLabel, VerticalNavigationItemTrigger } from "@salt-ds/core";
import { Link } from "react-router";

<VerticalNavigation aria-label='Main navigation'>
  {items.map((item) => (
    <VerticalNavigationItem key={item.id} active={isActive(item.path)}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger render={<Link to={item.path} />}>
          <VerticalNavigationItemLabel>{item.label}</VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  ))}
</VerticalNavigation>
```

## Example (collapsible submenus)

```tsx
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@salt-ds/core";

<VerticalNavigationItem active={parentActive}>
  <Collapsible>
    <VerticalNavigationItemContent>
      <CollapsibleTrigger>
        <VerticalNavigationItemTrigger render={<Link to={path} />}>
          <VerticalNavigationItemLabel>Parent Item</VerticalNavigationItemLabel>
          <VerticalNavigationItemExpansionIcon />
        </VerticalNavigationItemTrigger>
      </CollapsibleTrigger>
    </VerticalNavigationItemContent>
    <CollapsiblePanel>
      <VerticalNavigationSubMenu>
        {children.map((child) => (
          // nested VerticalNavigationItem with same pattern
        ))}
      </VerticalNavigationSubMenu>
    </CollapsiblePanel>
  </Collapsible>
</VerticalNavigationItem>
```
