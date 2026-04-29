# Flex Item

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/flex-item
- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/flex-layout
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout-flex-item--flex-item-wrapper

## When to use

- To control alignment of an individual item independently from the parent flex container.
- To make one item grow or shrink differently from sibling items in the same layout.
- To set an item’s initial main-axis size using `basis` before flex distribution occurs.
- To apply item-level spacing (`margin`/`padding`) in `FlexLayout`, `FlowLayout`, `StackLayout`, or `SplitLayout` compositions.

## When not to use

- When a simpler layout primitive (`FlowLayout`, `StackLayout`, or `SplitLayout`) already satisfies the layout without item-level overrides.
- When you need two-dimensional row-and-column placement; use `GridLayout`/`GridItem`.
- For page-level structure; prefer `GridLayout` or `BorderLayout`.

## Accessibility intent

- `FlexItem` is a structural layout wrapper with no component-specific keyboard behavior.
- Use semantic HTML via `as` where structure matters (for example `as="li"` inside a list).
- Ensure ARIA semantics come from the rendered element and surrounding pattern, not from layout wrappers.

## Decision trees

### FlexItem vs alternatives
- Need per-item alignment/size override within a flex-based parent? → Use `FlexItem`.
- Need only container-level layout control? → Configure the parent layout component first.
- Need fixed grid placement across rows and columns? → Use `GridItem` within `GridLayout`.

### Sizing and alignment choices
- Keep default sizing behavior? → Omit `grow`, `shrink`, and `basis`.
- Item should consume extra space? → Increase `grow`.
- Item should contract more/less than siblings? → Tune `shrink`.
- Item needs explicit initial size? → Set `basis`.
- Item needs cross-axis override? → Set `align`.

### Semantic rendering
- Rendering a semantic list/table-like structure? → Use `as` on `FlexItem` (and parent) to emit correct HTML elements.
- Purely presentational wrapper? → Keep default `div`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Parent layout choice is appropriate before applying item overrides
- [ ] `grow`/`shrink`/`basis` values reflect intended space distribution
- [ ] `align` override is intentional and tested in the active layout direction
- [ ] Semantic HTML via `as` is used where structure matters
- [ ] Responsive prop values resolve correctly at target breakpoints

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/flex-item
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/flex-item/FlexItem.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/flex-item/FlexItem.css
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--default
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--using-responsive-props
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--polymorphic-list
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout-flex-item--flex-item-wrapper

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./flex-item.md`
- Required behavior and constraints can be satisfied using props/states documented in `./flex-item.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./flex-item.json` |
| **Parent layout** | Place `FlexItem` inside a flex-based parent (`FlexLayout`, `FlowLayout`, `StackLayout`, or `SplitLayout`) |
| **Item sizing** | Use `grow`/`shrink`/`basis` only when item-level sizing overrides are required |
| **Alignment** | Set `align` only for per-item cross-axis overrides |
| **Semantics** | Use `as` to render semantic HTML elements when required by structure/accessibility |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./flex-item.json` |

### Validation
- [ ] Generated usage aligns with `./flex-item.md` "When to use"
- [ ] Generated usage avoids `./flex-item.md` "When not to use"
- [ ] Required props and value types match `./flex-item.json`
- [ ] Accessibility requirements from `./flex-item.json` are satisfied