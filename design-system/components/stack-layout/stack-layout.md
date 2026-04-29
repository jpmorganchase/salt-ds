# Stack Layout

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/stack-layout
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/stack-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/stack-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/stack-layout/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-stack-layout--default

## When to use

- When content should be consistently horizontal or vertical and non-wrapping behavior is acceptable.
- For small-scale interface sections (for example card stacks, chart stacks, or vertical side-panel groups).
- When you need responsive direction changes and/or visual separation using stack separators.

## When not to use

- When items must wrap across lines in row layouts; use `FlowLayout`.
- When layout requires more advanced customization than a simple one-dimensional stack; use `FlexLayout`.

## Accessibility intent

- Use semantic HTML when StackLayout represents a meaningful section.
- Prefer `as` to render appropriate elements (for example `ul`) and pair with semantic children (`li`).
- StackLayout itself adds no interactive semantics; accessibility depends on the rendered element type and child controls.

## Decision trees

### StackLayout vs alternatives
- Need one-dimensional ordered layout that should not wrap → use `StackLayout`.
- Need wrapping row behavior across breakpoints → use `FlowLayout`.
- Need richer flex controls (justify, wrap tuning, broader options) → use `FlexLayout`.

### Direction and separators
- Default vertical stacking → keep `direction="column"`.
- Horizontal stacking required → set `direction="row"`.
- Breakpoint-dependent orientation → use responsive `direction` object.
- Need visual division between items → use `separators` (`true` = centered separator).

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Layout intent is non-wrapping and one-dimensional
- [ ] `direction` and responsive values are intentional
- [ ] `separators` used only when visual separation improves comprehension
- [ ] Semantic `as` value selected when structure is meaningful
- [ ] Storybook IDs validated: `core-layout-stack-layout--default`, `core-layout-stack-layout--with-separators`
- [ ] SOURCE_GAP noted: legacy `core-stack-layout--default` ID does not resolve under current Storybook taxonomy

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/stack-layout/StackLayout.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/stack-layout/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/stack-layout/stack-layout.stories.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/__tests__/__e2e__/stack-layout/StackLayout.cy.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/stack-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/stack-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/stack-layout/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-stack-layout--default
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-stack-layout--with-separators
- https://storybook.saltdesignsystem.com/?path=/story/core-stack-layout--default

## AI generation rules (required)

### Select this component when
- You need a non-wrapping, one-dimensional layout in row/column directions.
- Direction may change responsively, but item flow should remain simple and ordered.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { StackLayout } from "@salt-ds/core";` |
| **Direction** | Default to `column`; set `row` only when horizontal stacking is needed |
| **Wrapping** | Do not rely on StackLayout for wrapping behavior; switch to `FlowLayout` if wrap is required |
| **Separators** | Use `separators` for visual item boundaries (`true` maps to centered) |
| **Spacing** | Use `gap` as Salt spacing multiplier; keep `margin`/`padding` minimal unless explicit |
| **Semantics** | Apply `as` to render semantic containers where appropriate |

### Validation
- [ ] Generated usage aligns with `./stack-layout.md` "When to use"
- [ ] Generated usage avoids `./stack-layout.md` "When not to use"
- [ ] Required props and value types match `./stack-layout.json`
- [ ] Accessibility requirements from `./stack-layout.json` are satisfied