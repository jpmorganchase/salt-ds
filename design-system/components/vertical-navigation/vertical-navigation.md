# Vertical Navigation

## When to use

Display persistent, multi-level navigation for applications and websites with complex information hierarchies. Use vertical navigation when:
- You have multiple levels of navigation (2-3 levels recommended)
- You're navigating between distinct webpages or applications
- You have more than eight top-level services at platform level
- Navigation items should remain visible on scroll (fixed header/sidebar display)
- You need to show an active/current location in the navigation hierarchy

## When not to use

- **Different content views on same page**: Use [Tabs](/salt/components/tabs/) to switch between content views
- **Minimalistic or single-page content**: Use [Link](/salt/components/link/) or [InteractableCard](/salt/components/card/) within page body
- **Horizontal space-constrained layouts**: Consider horizontal navigation alternatives for narrow viewports

## Decision trees

### Appearance (indicator vs bordered)
- Use **bordered** (default) for standard navigation with item boundaries
- Use **indicator** for a minimal accent-line style showing selection state

### Collapse/expand behavior
- Use **flat submenu** when all navigation levels are always visible
- Use **collapsible submenu** (with Collapsible) when top-level items have many children; collapse when parent item collapses to preserve space
- When a collapsed submenu contains the active item, mark the parent as active so users see navigation context

### Content enrichment
- Add **icons** to help signify purpose; use consistently across same hierarchy level
- Add **badges** only on leaf items (no chevron) for notifications or status
- Use **skip link** when navigation is on multiple pages and there is no "Skip to main content" link; required by WCAG 2.4.1 to bypass repeated content
- When vertical navigation is used inside a container, set that container's left padding to `0`
- When vertical navigation is used inside a drawer, apply `var(--salt-spacing-300)` padding to the drawer on all sides

## Validation checklist

- [ ] Accessible name provided via aria-label or aria-labelledby on VerticalNavigation root
- [ ] Each navigation link reflects current page via active prop (wrap VerticalNavigationItem)
- [ ] Submenu items are semantically nested (VerticalNavigationSubMenu inside VerticalNavigationItem)
- [ ] Routing library Link component used via render prop for client-side navigation
- [ ] If collapsible: active parent toggled when child is active; limit to 2 levels
- [ ] Keyboard Tab navigation enters/exits navigation items correctly
- [ ] Icons use aria-hidden attribute to avoid screen reader redundancy
- [ ] Container wrapping vertical navigation applies no left padding (`padding-left: 0`)

## Primary References

- [Core Source](https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/vertical-navigation)
- [Usage Docs](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/vertical-navigation/usage.mdx)
- [Examples Docs](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/vertical-navigation/examples.mdx)
- [Accessibility Docs](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/vertical-navigation/accessibility.mdx)
- Storybook Stories: [Basic](https://storybook.saltdesignsystem.com/?path=/story/core-vertical-navigation--basic) | [CollapsibleSubmenu](https://storybook.saltdesignsystem.com/?path=/story/core-vertical-navigation--collapsible-submenu) | [SubmenuFlat](https://storybook.saltdesignsystem.com/?path=/story/core-vertical-navigation--submenu-flat) | [WithIcon](https://storybook.saltdesignsystem.com/?path=/story/core-vertical-navigation--with-icon) | [WithExpandButton](https://storybook.saltdesignsystem.com/?path=/story/core-vertical-navigation--with-expand-button) | [WithMultipleActions](https://storybook.saltdesignsystem.com/?path=/story/core-vertical-navigation--with-multiple-actions) | [WithWrapping](https://storybook.saltdesignsystem.com/?path=/story/core-vertical-navigation--with-wrapping) | [WithTruncation](https://storybook.saltdesignsystem.com/?path=/story/core-vertical-navigation--with-truncation)

## Accessibility intent

**Navigation landmark**: VerticalNavigation renders as `<nav>` semantic element, automatically exposing navigation landmark to assistive technologies.

**Accessible naming**: Provide aria-label or aria-labelledby on the VerticalNavigation root element, especially when multiple navigation regions exist on the same page. Avoid adding "navigation" to the label; assistive technologies announce it automatically.

**Current page indication**: Mark the navigation item for the current page with active prop so users understand their location in the navigation hierarchy.

**Focus management**: Tab enters the first navigation item (or the currently active item if one was selected before Tab focus); Shift+Tab reverses navigation. Arrow keys may be used within custom implementations to navigate siblings.

**Interactive elements**: When using expand buttons or action menus alongside navigation items, provide clear aria-labelledby or aria-label to distinguish from the main link trigger.

## Notes

- For routing libraries (React Router, Next.js): Use the `render` prop on VerticalNavigationItemTrigger to supply a Link component, enabling client-side navigation and route matching.
- When displaying many items, consider collapsible sections (Collapsible wrapper) to reduce cognitive load.
- Use sentence case for item labels and descriptions; descriptions can wrap to multiple lines in vertical layout.
- This file is intentionally conservative and avoids unsourced claims.