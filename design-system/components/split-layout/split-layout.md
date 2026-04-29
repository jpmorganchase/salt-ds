# Split layout

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/split-layout
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/split-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/split-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/split-layout/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-split-layout--default

## When to use

- If you need two defined areas at opposite ends of a container.
- For interfaces such as app headers and button bars where left/right group separation is needed.
- For responsive two-region layouts that may switch orientation by breakpoint.

## When not to use

- If your layout requires more than two regions; use `FlowLayout` instead.
- If you need more complex flexible composition; consider `FlexLayout`.
- If content is master-detail dependent rather than peer regions; consider `ParentChildLayout`.

## Accessibility intent

- Apply semantic HTML when SplitLayout represents a meaningful page subsection.
- Use the `as` prop to render appropriate semantic container elements instead of default `div`.
- Ensure item content (for example buttons, lists, labels) remains accessible and correctly structured.

## Decision trees

### SplitLayout vs alternatives
- Need exactly two peer regions at opposite ends of one container → use `SplitLayout`
- Need more than two items or flowing wraps → use `FlowLayout`
- Need lower-level control across many items/responsive axes → use `FlexLayout`
- Need dependent parent/child master-detail regions → use `ParentChildLayout`

### Direction and responsive behavior
- Standard horizontal separation → `direction="row"` (default)
- Vertical separation required → `direction="column"`
- Responsive orientation changes by breakpoint → provide responsive `direction` object

## Validation checklist

- [ ] Layout models exactly two regions (`startItem`, `endItem`) where intended
- [ ] `direction` reflects desired axis behavior across breakpoints
- [ ] `align` is intentional and matches vertical/horizontal alignment expectations
- [ ] `gap`, `padding`, and `margin` values follow spacing intent
- [ ] Semantic `as` value is used when layout maps to semantic structures
- [ ] Storybook IDs validated: `core-layout-split-layout--default`, `--end-only`, `--simple-usage`, `--vertical`
- [ ] SOURCE_GAP noted: legacy `core-split-layout--default` story ID does not resolve

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/split-layout/SplitLayout.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/split-layout/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/split-layout/split-layout.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/split-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/split-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/split-layout/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-split-layout--default
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-split-layout--end-only
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-split-layout--simple-usage
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-split-layout--vertical
- https://storybook.saltdesignsystem.com/?path=/story/core-split-layout--default

## AI generation rules (required)

### Select this component when
- Intent is to place two regions at opposite ends of one container.
- Start/end content should remain peers rather than parent-child dependent.
- Responsive direction changes are needed with minimal layout complexity.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { SplitLayout } from "@salt-ds/core";` |
| **Items** | Provide `startItem` and/or `endItem`; if only `endItem` exists, content is end-aligned |
| **Direction** | Default to `row`; use `column` or responsive direction map only when layout intent requires it |
| **Alignment** | Apply `align` for cross-axis positioning; use `center` for balanced bars by default |
| **Spacing** | Keep `margin`/`padding` at `0` unless explicit spacing requirements exist |
| **Semantics** | Use `as` for semantic container rendering when needed (e.g., `ul`) |

### Validation
- [ ] Generated usage aligns with `./split-layout.md` "When to use"
- [ ] Generated usage avoids `./split-layout.md` "When not to use"
- [ ] Required props and value types match `./split-layout.json`
- [ ] Accessibility requirements from `./split-layout.json` are satisfied
