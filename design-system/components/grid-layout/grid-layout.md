# Grid Layout

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/grid-layout
- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/grid-item
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--default

## When to use

- When content is best presented using a configurable number of columns and rows (for example forms and dashboards).
- For content regions where grouped blocks sit alongside each other, such as main content areas, dialogs, and drawers.
- When layout must adapt across viewport and device sizes with responsive column/row behavior.

## When not to use

- For high-level app chrome (header, footer, primary navigation regions); use `BorderLayout`.
- For one-dimensional arrangements only (single row or single column flow); use `StackLayout`, `FlowLayout`, or `FlexLayout`.

## Accessibility intent

- Apply semantic HTML for layout regions by using the `as` prop on `GridLayout` and `GridItem`.
- `GridLayout` itself has no component-specific keyboard interaction.
- Accessibility semantics should come from the rendered HTML element and surrounding pattern.

## Decision trees

### GridLayout vs alternatives
- Need two-dimensional placement with rows and columns? → Use `GridLayout`.
- Need top-level app shell regions? → Use `BorderLayout`.
- Need only single-axis distribution? → Use flex-based layout primitives.

### Container configuration
- Need default behavior quickly? → Start with defaults (`columns=12`, `rows=1`, `gap=3`).
- Need explicit track templates? → Use string values for `columns` and/or `rows`.
- Need different horizontal/vertical spacing? → Use `columnGap` and `rowGap` instead of shared `gap`.
- Need viewport-specific behavior? → Use responsive prop values and optional custom breakpoints via `SaltProvider`.

### Child strategy
- Need item-level spanning/alignment control? → Wrap content in `GridItem`.
- Very simple layout with no spanning needs? → Direct children are acceptable.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `columns` and `rows` definitions match intended layout behavior
- [ ] `gap` vs `columnGap`/`rowGap` choice is intentional
- [ ] Responsive values are validated at target breakpoints
- [ ] `GridItem` is used when per-item span/alignment control is required
- [ ] Semantic HTML via `as` is used for accessible page structure

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/grid-layout
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/grid-layout/GridLayout.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/grid-layout/GridLayout.css
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/grid-item
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--default
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--with-padding-and-margins
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--responsive-view-with-custom-breakpoints
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--footer
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--composite
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--nested
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--column-template

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./grid-layout.md`
- Required behavior and constraints can be satisfied using props/states documented in `./grid-layout.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./grid-layout.json` |
| **Default setup** | Start with `columns={12}`, `rows={1}`, `gap={3}` unless intent requires explicit templates |
| **Spacing** | Use `gap` for shared spacing; use `columnGap` and `rowGap` for axis-specific control |
| **Children** | Prefer `GridItem` children when span or alignment behavior is required |
| **Responsive behavior** | Use responsive props for viewport-dependent layout changes |
| **Semantics** | Use `as` to render semantic HTML landmarks/regions where appropriate |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./grid-layout.json` |

### Validation
- [ ] Generated usage aligns with `./grid-layout.md` "When to use"
- [ ] Generated usage avoids `./grid-layout.md` "When not to use"
- [ ] Required props and value types match `./grid-layout.json`
- [ ] Accessibility requirements from `./grid-layout.json` are satisfied