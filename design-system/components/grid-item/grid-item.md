# Grid Item

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/grid-item
- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/grid-layout
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/accessibility.mdx
- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/grid-layout
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout-grid-item--grid-item-wrapper

## When to use

- To represent a single item inside `GridLayout` when you need per-item control over span (`colSpan`, `rowSpan`).
- To control item-level placement behavior in a grid cell using `horizontalAlignment` and `verticalAlignment`.
- To build responsive grid compositions where item span changes by breakpoint.
- To apply item-level spacing (`margin`/`padding`) while keeping container spacing in `GridLayout`.

## When not to use

- When only container-level structure is needed; configure `GridLayout` props without item overrides.
- For one-dimensional layout distribution; use `FlexLayout`/`FlowLayout` instead.
- As an interactive behavior component; `GridItem` is a structural wrapper and does not add interaction logic.

## Accessibility intent

- `GridItem` has no component-specific keyboard interactions.
- Accessibility semantics come from the rendered HTML element and surrounding UI pattern.
- Use `as` to render semantic elements when structure matters.
- SOURCE_GAP: no dedicated `grid-item` accessibility page was found; guidance is inferred from `GridItem` source and grid-layout accessibility documentation.

## Decision trees

### GridItem vs alternatives
- Need two-dimensional placement or spanning within a grid? → Use `GridItem` in `GridLayout`.
- Need only row/column template and gap at container level? → Configure `GridLayout` first.
- Need linear axis layout behavior? → Use flex-based layout primitives.

### Span and alignment choices
- Need default placement and size? → Keep defaults (`colSpan`/`rowSpan` as `auto`, alignment `stretch`).
- Need a larger visual area? → Increase `colSpan` and/or `rowSpan`.
- Need item content anchored within the cell? → Set `horizontalAlignment` and `verticalAlignment`.
- Need breakpoint-specific behavior? → Use responsive prop values.

### Semantic rendering
- Semantic structure required (for example list or section semantics)? → Set `as` appropriately.
- Pure layout wrapper? → Keep default `div`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `GridItem` is used inside a `GridLayout` context
- [ ] `colSpan`/`rowSpan` values are intentional and tested at target breakpoints
- [ ] Alignment props are only set when default stretch behavior is not desired
- [ ] Semantic HTML via `as` is used where required
- [ ] Accessibility and behavior expectations are provided by child components, not by `GridItem`

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/grid-item
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/grid-item/GridItem.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/grid-item/GridItem.css
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/grid-layout
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/grid-layout/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/grid-layout
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout--default
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-grid-layout-grid-item--grid-item-wrapper

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./grid-item.md`
- Required behavior and constraints can be satisfied using props/states documented in `./grid-item.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./grid-item.json` |
| **Parent layout** | Use `GridItem` inside `GridLayout` to achieve grid placement behavior |
| **Span control** | Use `colSpan`/`rowSpan` only when item size differs from default cell occupancy |
| **Alignment** | Apply `horizontalAlignment`/`verticalAlignment` only when non-default cell alignment is required |
| **Semantics** | Use `as` for semantic HTML when required by structure or accessibility |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./grid-item.json` |

### Validation
- [ ] Generated usage aligns with `./grid-item.md` "When to use"
- [ ] Generated usage avoids `./grid-item.md` "When not to use"
- [ ] Required props and value types match `./grid-item.json`
- [ ] Accessibility requirements from `./grid-item.json` are satisfied