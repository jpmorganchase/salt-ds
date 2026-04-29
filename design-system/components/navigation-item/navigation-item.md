# NavigationItem

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/navigation-item
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/navigation-item/NavigationItem.tsx
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/navigation-item/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/navigation-item/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/navigation-item/accessibility.mdx
- Storybook:
  - https://storybook.saltdesignsystem.com/?path=/story/core-navigation-item--default
  - https://storybook.saltdesignsystem.com/?path=/story/core-navigation-item--horizontal-group
  - https://storybook.saltdesignsystem.com/?path=/story/core-navigation-item--vertical-group
- Stories source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/navigation-item/navigation-item.stories.tsx
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/navigation-item/NavigationItem.cy.tsx

## When to use

- When your app/site has multiple levels of navigation.
- For platform-level navigation across distinct pages/apps (horizontal for smaller sets, vertical for larger sets).
- When navigation should remain visible during scroll (for example fixed header/side regions).

## When not to use

- To switch views within the same page; use `Tabs` instead.
- For very specific/local content routing where a simple `Link` or `InteractableCard` in-page is more appropriate.

## Accessibility intent

- Mark the current destination with `active` so current-page semantics are exposed.
- Use parent expansion semantics for nested vertical navigation.
- Wrap sets of navigation items in a `nav` landmark with an accessible name.

## Decision trees

### NavigationItem vs alternatives
- Need cross-page/application navigation items? → Use `NavigationItem`.
- Need in-page view switching? → Use `Tabs`.
- Need standalone content link within body text/cards? → Use `Link` or `InteractableCard`.

### Horizontal vs vertical
- Fewer top-level items and limited header space? → Prefer horizontal group.
- Many services/pages (more than ~8) or deep hierarchy? → Prefer vertical group.
- Building new vertical navigation structures? → Prefer `VerticalNavigation` where feasible (NavigationItem vertical usage is planned for deprecation).

### Parent/nesting behavior
- Item opens child items instead of direct navigation? → Use `parent` + `expanded` + `onExpand`, and omit `href`.
- Parent collapsed while child route is active? → Use `blurActive` to retain parent indicator context.
- Need deep hierarchy? → Keep depth limited and clearly labeled.

### Routing integration
- Using React Router/Next.js/etc.? → Use `render` prop to supply router-aware link/button implementation.
- Standard link behavior sufficient? → Use `href` and default rendering.

## Validation checklist

- [ ] Usage matches "When to use" guidance
- [ ] Not used for in-page view switching
- [ ] `active` reflects current destination only
- [ ] Parent items use expansion semantics correctly (`parent`, `expanded`, `onExpand`)
- [ ] Parent-only triggers without destination do not misuse `href`
- [ ] Navigation group is wrapped in `nav` landmark with clear label
- [ ] Labels are concise sentence case and fit orientation guidance
- [ ] Hierarchy depth and badge/icon usage remain clear and consistent

## Primary references

- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/navigation-item/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/navigation-item/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/navigation-item/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/navigation-item/NavigationItem.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/navigation-item/navigation-item.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/navigation-item/NavigationItem.cy.tsx

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./navigation-item.md`
- Required behavior and constraints can be satisfied using props/states documented in `./navigation-item.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./navigation-item.json` |
| **Semantics** | Use `href` for destination links; use parent expansion props for non-link parent triggers |
| **State** | Set `active` on current item only; use `blurActive` for collapsed parents containing active descendants |
| **Orientation** | Use horizontal for compact top nav; vertical for larger/stacked structures |
| **Routing** | Use `render` for router integration when needed |
| **Accessibility** | Place items in a labeled `nav` landmark and preserve active/expanded semantics |

### Validation
- [ ] Generated usage aligns with `./navigation-item.md` "When to use"
- [ ] Generated usage avoids `./navigation-item.md` "When not to use"
- [ ] Required props and value types match `./navigation-item.json`
- [ ] Accessibility requirements from `./navigation-item.json` are satisfied
