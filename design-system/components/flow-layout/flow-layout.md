# Flow Layout

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/flow-layout
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flow-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flow-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flow-layout/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-flow-layout--default

## When to use

- To build responsive layouts that wrap across multiple rows when horizontal space is constrained.
- For small-scale in-application layouts such as metric cards or filter-control header rows.

## When not to use

- When you need a row layout that never wraps; use `StackLayout`.
- When you need more complex layout customization (for example responsive direction switching); use `FlexLayout`.

## Accessibility intent

- `FlowLayout` is a structural container with no component-specific keyboard behavior.
- Use semantic HTML via `as` for meaningful structure in page subsections.
- ARIA semantics should come from rendered elements and surrounding patterns rather than layout wrapper defaults.

## Decision trees

### FlowLayout vs alternatives
- Need a row-oriented layout that always wraps as space tightens? → Use `FlowLayout`.
- Need non-wrapping layout or directional switching? → Use `FlexLayout` or `StackLayout` depending on requirements.
- Need two-dimensional row+column placement? → Use `GridLayout`.

### Position and spacing choices
- Need row-level cross-axis alignment? → Set `align`.
- Need row-level main-axis distribution? → Set `justify`.
- Need inter-item rhythm? → Set `gap`.
- Need container spacing control? → Set `margin`/`padding`.

### Item-level control
- One item needs custom cross-axis position? → Wrap with `FlexItem` and set its `align`.
- One item should consume extra space? → Use `FlexItem` `grow`/`shrink`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Wrapping behavior is intentional and verified at constrained widths
- [ ] `align`/`justify` settings match expected row positioning
- [ ] Spacing (`gap`, `margin`, `padding`) follows Salt spacing scale
- [ ] Item-level overrides are applied via `FlexItem` only when needed
- [ ] Semantic HTML via `as` is applied where structure matters

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/flow-layout
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/flow-layout/FlowLayout.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flow-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flow-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flow-layout/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flow-layout--default

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./flow-layout.md`
- Required behavior and constraints can be satisfied using props/states documented in `./flow-layout.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./flow-layout.json` |
| **Wrap behavior** | Assume wrapping row behavior by default; do not model `FlowLayout` as non-wrapping |
| **Composition** | Use `FlexItem` for per-item overrides; keep container-level control in `FlowLayout` props |
| **Spacing** | Prefer Salt spacing multipliers for `gap`, `margin`, and `padding` |
| **Semantics** | Use `as` when semantic container elements are required |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./flow-layout.json` |

### Validation
- [ ] Generated usage aligns with `./flow-layout.md` "When to use"
- [ ] Generated usage avoids `./flow-layout.md` "When not to use"
- [ ] Required props and value types match `./flow-layout.json`
- [ ] Accessibility requirements from `./flow-layout.json` are satisfied