# Menu

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/menu
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/Menu.tsx
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/MenuBase.tsx
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/MenuTrigger.tsx
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/MenuPanel.tsx
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/MenuItem.tsx
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/MenuGroup.tsx
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/menu/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/menu/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/menu/accessibility.mdx
- Storybook:
  - https://storybook.saltdesignsystem.com/?path=/story/core-menu--single-level
  - https://storybook.saltdesignsystem.com/?path=/story/core-menu--multi-level
  - https://storybook.saltdesignsystem.com/?path=/story/core-menu--grouped-items
- Stories source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/menu/menu.stories.tsx
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/menu/Menu.cy.tsx

## When to use

- When you need to display a list of actions or options from a trigger.
- When space is limited and overflow actions should be shown on demand.
- When you need to surface secondary or less prominent actions from a compact control.

## When not to use

- Inside forms for value selection inputs; use `ComboBox` or `Dropdown` instead.

## Accessibility intent

- Menus support full keyboard operation for opening, navigation, activation, and submenu traversal.
- Focus should move predictably between trigger, menu items, and nested submenus.
- Group related actions with labeled `MenuGroup` when categories improve scanability.

## Decision trees

### Menu vs alternatives
- Need action commands from a trigger? → Use `Menu`.
- Need user value selection in a form field? → Use `Dropdown` or `ComboBox`.
- Need always-visible primary actions? → Use inline `Button`/toolbar actions instead of hiding behind menu.

### Menu depth and grouping
- Flat command list? → Use single-level menu.
- Related nested commands? → Use multi-level submenus, but keep depth low.
- Distinct action categories? → Use `MenuGroup` labels or separator-only groups.

### Trigger and placement
- Standard trigger button/menu item anchor? → Use `MenuTrigger`.
- Context menu at pointer location? → Use `getVirtualElement`.
- Non-default alignment needed? → Override `placement`.

### Content style
- Keep labels concise and sentence case.
- Use leading icons only when they improve recognition and remain consistent within a group.
- Add ellipsis to actions that open follow-up dialogs or require more input.

## Validation checklist

- [ ] Usage matches "When to use" guidance
- [ ] Not used in forms as a value-input replacement
- [ ] Trigger and panel structure is valid (`MenuTrigger` + `MenuPanel`)
- [ ] Menu item labels are concise sentence case
- [ ] Disabled items are intentional and non-interactive
- [ ] Submenu depth is limited and understandable
- [ ] Keyboard interaction and focus return behavior are preserved
- [ ] Group labels/separators are used only when they improve comprehension

## Primary references

- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/menu/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/menu/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/menu/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/MenuBase.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/MenuItem.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/menu/MenuGroup.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/menu/menu.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/menu/Menu.cy.tsx

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./menu.md`
- Required behavior and constraints can be satisfied using props/states documented in `./menu.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./menu.json` |
| **Structure** | Build with `Menu` + `MenuTrigger` + `MenuPanel`; place actions in `MenuItem` |
| **Interaction** | Use `onOpenChange` only when state observation/control is needed |
| **Grouping** | Use `MenuGroup` for related actions; omit labels only for intentional separators |
| **Depth** | Keep submenu nesting shallow and task-focused |
| **Accessibility** | Preserve keyboard behavior and focus return to trigger on close |

### Validation
- [ ] Generated usage aligns with `./menu.md` "When to use"
- [ ] Generated usage avoids `./menu.md` "When not to use"
- [ ] Required props and value types match `./menu.json`
- [ ] Accessibility requirements from `./menu.json` are satisfied
