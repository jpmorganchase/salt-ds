# Badge

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/badge
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/badge/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/badge/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/badge/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-badge--icon

## When to use

- To communicate a non-interactive, system-driven change to the anchored component (for example tabs, pages, or containers).
- To summarize counts or short labels that provide quick context (for example unread items).
- To show compact inline emphasis within content by rendering badge without `children`.

## When not to use

- To trigger an immediate action or represent an interactive control. Instead, use `Pill` for interactive selection/action contexts.
- To communicate red/amber/green style status via color. Instead, use `Pill`.
- To communicate read-only metadata categories/groups. Instead, use `Tag`.
- To display long values; keep content short (about 4–6 characters), truncating long strings when needed.

## Decision trees

### Badge vs similar components
- Need a non-interactive annotation/count attached to content → Use `Badge`
- Need interactive category/filter chips → Use `Pill`
- Need read-only metadata/category labels → Use `Tag`

### Value configuration
- Need a dot indicator only → Omit `value`
- Need numeric count with overflow cap → Set numeric `value` and optional `max` (default behavior caps at `999+`)
- Need a short text marker (for example `NEW`) → Set string `value`

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `value` type is `number` or `string`, or omitted for dot badges
- [ ] `max` is only used with numeric values and overflow behavior is expected (`max+`)
- [ ] Focusable anchored element has `aria-label`/`aria-labelledby` that includes badge meaning
- [ ] Inline badge labeling provides additional context when needed

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./badge.md`
- Required behavior and constraints can be satisfied using props/states documented in `./badge.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./badge.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./badge.json` |

### Validation
- [ ] Generated usage aligns with `./badge.md` "When to use"
- [ ] Generated usage avoids `./badge.md` "When not to use"
- [ ] Required props and value types match `./badge.json`
- [ ] Accessibility requirements from `./badge.json` are satisfied

## Accessibility intent

- When a badge is anchored to a child component, the focusable element should include an `aria-label` or `aria-labelledby` that describes badge meaning (for example, "9 notifications").
- For inline badges, screen readers announce badge contents; use `aria-label` when additional context is required.
- Dot badge contrast in dark mode may fall below 3:1 in some themes; this is documented upstream as an accessibility disclaimer.

## Notes

- SOURCE_GAP: `core-badge--default` story ID is unresolved; current verified Storybook coverage uses `core-badge--icon` and related badge stories.

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/badge
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/badge/Badge.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/badge/index.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/badge/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/badge/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/badge/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/badge/badge.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-badge--icon
- https://storybook.saltdesignsystem.com/?path=/story/core-badge--max-number
- https://storybook.saltdesignsystem.com/?path=/story/core-badge--default-truncation
- https://storybook.saltdesignsystem.com/?path=/story/core-badge--string
- https://storybook.saltdesignsystem.com/?path=/story/core-badge--inline-badge
- https://storybook.saltdesignsystem.com/?path=/story/core-badge--multiple-buttons
- https://storybook.saltdesignsystem.com/?path=/story/core-badge--dot-badge
- https://storybook.saltdesignsystem.com/?path=/story/core-badge--inline-dot-badge