# Accordion

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/accordion
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/accordion/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/accordion/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/accordion/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-accordion--default

## When to use

- To organize related content within expandable groups/categories/sections
- To reduce scrolling or overall page length when displaying content in full isn't critical
- When you can't display all the content at once due to restricted screen space

## When not to use

- To replace grouped rows with grids — use `Table` instead
- Avoid nested accordions

## Decision trees

### Should I use Accordion or Details element?
- Accordion is for **multiple related content sections** within a component hierarchy → Use **AccordionGroup**
- Details is for **single expandable content** on a page → Use **`<details>` HTML element**

### Controlled vs. uncontrolled?
- Multiple accordions where only one should be open at a time → **Controlled mode** with `expanded` + `onToggle` or `value` prop
- Each accordion independent, user controls each → **Uncontrolled mode** with `defaultExpanded`

### Where should the indicator icon be?
- Left (default): Best for forms, dense layouts, accessibility compliance with zoom
- Right: Mobile-first, drag handles, icon-heavy layouts

## Validation checklist

- [ ] Accordion headers have clear, descriptive labels
- [ ] Controlled mode: Check that parent component properly manages `expanded` state and `onToggle` callback
- [ ] Keyboard accessible: Tab navigates to accordion headers, Enter/Space toggles state
- [ ] Grouped accordions: Only use `AccordionGroup` with multiple `Accordion` items (never nest)
- [ ] Status indicator: Only use `error`, `warning`, `success` — not custom styling
- [ ] Accessibility: Ensure `aria-expanded`, `aria-controls`, and role attributes are set (handled automatically)

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/accordion
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/accordion/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/accordion/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/accordion/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-accordion--default
- https://storybook.saltdesignsystem.com/?path=/story/core-accordion--default-group
- https://storybook.saltdesignsystem.com/?path=/story/core-accordion--exclusive-group
- https://storybook.saltdesignsystem.com/?path=/story/core-accordion--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-accordion--status
- https://storybook.saltdesignsystem.com/?path=/story/core-accordion--additional-labels

## Notes

- SOURCE_GAP: The following discovered Storybook IDs did not resolve during sync validation and are excluded from `Primary references` until confirmed upstream:
  - `core-accordion--indicator-side`
  - `core-accordion--expand-all`

## Accessibility intent

- The accordion header acts as a button with keyboard navigation (Enter/Space to toggle)
- The expanded/collapsed state is announced via `aria-expanded` attribute
- Accordion headers are keyboard accessible and navigable via Tab
- Use meaningful labels on headers so the purpose is clear to assistive technologies
- Keep heading levels consistent across grouped accordion headers and preserve proper heading hierarchy
- Known issue: in VoiceOver/Safari, dynamic expanded/collapsed state announcements may be inconsistent

## Composition

- **Accordion** wraps individual expandable items
- **AccordionGroup** manages multiple Accordions (allows multiple open or single open)
- **AccordionHeader** contains the clickable label and indicator
- **AccordionPanel** contains the content to expand/collapse
- Pair with `Badge`, `Text`, `StackLayout` for labels, badges, and layout

## Key variants

- **indicatorSide**: Position the chevron icon (`left` or `right`)
  - Left: Default, keeps focus near label
  - Right: Suitable for mobile, descriptive icons, drag-handle patterns
- **status**: Visual status indicator (`error`, `warning`, `success`, or default)
- **disabled**: Prevents interaction on specific accordions
- **expanded/defaultExpanded**: Control expand state
  - `expanded` + `onToggle`: Fully controlled mode (you manage state)
  - `defaultExpanded`: Uncontrolled mode (component manages state)
  - `value` prop: Identifies accordion within an AccordionGroup for controlled group behavior
- **onToggle**: Callback when accordion toggles for event tracking or parent state updates

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./accordion.md`
- Required behavior and constraints can be satisfied using props/states documented in `./accordion.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./accordion.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./accordion.json` |

### Validation
- [ ] Generated usage aligns with `./accordion.md` "When to use"
- [ ] Generated usage avoids `./accordion.md` "When not to use"
- [ ] Required props and value types match `./accordion.json`
- [ ] Accessibility requirements from `./accordion.json` are satisfied