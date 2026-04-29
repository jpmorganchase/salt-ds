# Flex Layout

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/flex-layout
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--default

## When to use

- When a complex one-dimensional layout cannot first be achieved by `FlowLayout`, `StackLayout`, or `SplitLayout`.
- When layout direction and overflow behavior must change based on viewport/device conditions.
- For small-scale component layout inside a region or container.

## When not to use

- When `FlowLayout`, `StackLayout`, or `SplitLayout` already matches the requirement in a constant direction.
- When content must be laid out across rows and columns simultaneously; use `GridLayout`.
- For large page-level structure; use `GridLayout` or `BorderLayout`.

## Accessibility intent

- `FlexLayout` is a structural container with no component-specific keyboard interaction.
- Use semantic HTML via `as` to preserve document meaning (for example `as="ol"` with `FlexItem as="li"`).
- ARIA semantics should come from rendered elements and containing patterns, not from layout wrappers alone.

## Decision trees

### FlexLayout vs layout alternatives
- Need one-dimensional layout with responsive direction/wrap control? → Use `FlexLayout`.
- Need always-row wrapping behavior with simpler API? → Use `FlowLayout`.
- Need primarily stacked axis with optional separators? → Use `StackLayout`.
- Need structured two-dimensional placement? → Use `GridLayout`.

### Direction and wrapping
- Content should flow horizontally by default? → Keep `direction="row"`.
- Content should stack vertically? → Set `direction="column"`.
- Need order inversion? → Use `row-reverse` or `column-reverse`.
- Need overflow onto additional lines? → Set `wrap={true}`.

### Spacing and alignment
- Control cross-axis alignment for all items? → Set `align`.
- Control main-axis distribution? → Set `justify`.
- Control inter-item distance? → Set `gap`.
- Control container outer/inner spacing? → Set `margin` and `padding`.

### Separator usage
- Need separators in a non-wrapping flex row/column? → `separators` can be used.
- Prefer current recommended separator behavior? → Use `StackLayout` separators when applicable.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Layout primitive selection is justified against `FlowLayout`/`StackLayout`/`SplitLayout` alternatives
- [ ] Direction/wrap behavior is verified at target breakpoints
- [ ] `align` and `justify` settings match intended cross/main-axis behavior
- [ ] `gap`, `margin`, and `padding` values match spacing intent
- [ ] Semantic HTML is applied via `as` where structure matters

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/flex-layout
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/flex-layout/FlexLayout.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/flex-layout/FlexLayout.css
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/flex-layout/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--default
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--with-padding-and-margins
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--with-separators
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--using-responsive-props
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--nested
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-flex-layout--polymorphic-list

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./flex-layout.md`
- Required behavior and constraints can be satisfied using props/states documented in `./flex-layout.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./flex-layout.json` |
| **Children** | Prefer composing children as `FlexItem` when item-level alignment/size overrides are needed |
| **Direction** | Default to `row`; use `column` or responsive direction values when viewport behavior requires it |
| **Spacing** | Use Salt spacing multipliers for `gap`, `margin`, and `padding` unless explicit CSS units are required |
| **Wrap** | Enable `wrap` only when overflow to additional lines is intended |
| **Semantics** | Use `as` to emit semantic container elements when structural meaning is required |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./flex-layout.json` |

### Validation
- [ ] Generated usage aligns with `./flex-layout.md` "When to use"
- [ ] Generated usage avoids `./flex-layout.md` "When not to use"
- [ ] Required props and value types match `./flex-layout.json`
- [ ] Accessibility requirements from `./flex-layout.json` are satisfied