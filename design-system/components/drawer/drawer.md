# Drawer

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/drawer
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/drawer/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/drawer/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/drawer/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-drawer--default

## When to use

- To reveal additional functionality or information contextual to on-screen content that users can close when no longer needed.
- To show supporting content such as forms or navigation in a dedicated area of the screen.
- To let users show and hide relevant supporting content while keeping focus in the current task.
- For modal side/top/bottom surfaces where background content must remain inert.

## When not to use

- To provide an inlaid drawer that opens inline with content; use `BorderLayout` instead.
- To provide a permanently docked, always-visible panel; use `Panel` with expandable/collapsible styling instead.

## Accessibility intent

- Drawer behaves as a modal dialog surface and traps focus while open.
- Keyboard interaction supports trigger activation with Enter/Space, tab cycle within drawer, Shift+Tab reverse cycle, and Escape to close.
- Focus returns to the trigger after close.
- Provide an accessible name for drawer content (for example via `aria-labelledby` pointing to a heading).
- Use `DrawerCloseButton` or another clearly labeled close action.

## Decision trees

### Drawer vs BorderLayout vs Panel
- Need modal, temporary, dismissible supporting surface? → Use `Drawer`.
- Need inline/inlaid structural page region? → Use `BorderLayout`.
- Need fixed, always-visible docked region? → Use `Panel`.

### Position selection
- Supporting side information or forms? → `position="right"` (or `left` default).
- Horizontal filter/summary context? → `position="top"`.
- Master-detail content requiring wider horizontal space? → `position="bottom"`.

### Dismiss and scrim behavior
- Users can click away to dismiss modal support content? → Default (`disableDismiss={false}`).
- Action must be completed before close? → Set `disableDismiss={true}`.
- Desktop-like non-obscured background needed? → Set `disableScrim={true}`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `open` and `onOpenChange` are wired correctly for controlled visibility
- [ ] `position` and size (`width`/`height`) are suitable for content and layout intent
- [ ] Dismiss behavior (`disableDismiss`) matches task criticality
- [ ] Scrim behavior (`disableScrim`) is intentional for context
- [ ] Focus trap and Escape close behavior work as expected
- [ ] Visual variant (`primary`/`secondary`/`tertiary`) matches intended emphasis

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/drawer
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/drawer/Drawer.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/drawer/DrawerCloseButton.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/drawer/index.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/drawer/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/drawer/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/drawer/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-drawer--default
- https://storybook.saltdesignsystem.com/?path=/story/core-drawer--position
- https://storybook.saltdesignsystem.com/?path=/story/core-drawer--top-drawer-usage-example
- https://storybook.saltdesignsystem.com/?path=/story/core-drawer--right-drawer-usage-example
- https://storybook.saltdesignsystem.com/?path=/story/core-drawer--bottom-drawer-usage-example
- https://storybook.saltdesignsystem.com/?path=/story/core-drawer--optional-close-action

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./drawer.md`
- Required behavior and constraints can be satisfied using props/states documented in `./drawer.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./drawer.json` |
| **State model** | Use controlled visibility with `open` + `onOpenChange` |
| **Placement** | Use `left` by default; choose `right`, `top`, or `bottom` by content format and context |
| **Close control** | Include `DrawerCloseButton` or equivalent labeled close action |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./drawer.json` |

### Validation
- [ ] Generated usage aligns with `./drawer.md` "When to use"
- [ ] Generated usage avoids `./drawer.md` "When not to use"
- [ ] Required props and value types match `./drawer.json`
- [ ] Accessibility requirements from `./drawer.json` are satisfied
- [ ] Focus remains trapped and returns to trigger on close