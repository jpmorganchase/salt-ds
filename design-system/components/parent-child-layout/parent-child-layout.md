# Parent-child layout

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/parent-child-layout
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/parent-child-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/parent-child-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/parent-child-layout/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-parent-child-layout--default

## When to use

- To organize content into two areas: a larger area and a smaller area that controls the larger area.
- For master-detail interactions where parent selection determines child detail content.
- For responsive preference/settings interfaces where one view is shown at a time on smaller breakpoints.

## When not to use

- To position more than two layout items along one dimension; use `FlexLayout`, `FlowLayout`, `StackLayout`, or `SplitLayout` instead.
- To position more than two items in a grid; use `GridLayout` instead.
- For generic multi-region page shells; prefer `BorderLayout` when regions are not master-detail dependent.

## Accessibility intent

- Apply semantic HTML to parent/child section content when building subsections with `ParentChildLayout`.
- The layout container itself is structural; accessibility quality depends on semantics and labeling of provided `parent` and `child` content.
- Ensure focus order remains logical when switching `visibleView` in collapsed mode.

## Decision trees

### Parent-child layout vs other layouts
- Need exactly two related regions (master controls + dependent detail) → use `ParentChildLayout`
- Need simple horizontal/vertical arrangement of multiple peers → use `FlexLayout`/`FlowLayout`/`StackLayout`/`SplitLayout`
- Need 2D placement of multiple items → use `GridLayout`

### Collapsed behavior strategy
- Small viewport should prioritize detail content first → `visibleView="child"` (default)
- Small viewport should prioritize navigation/selection content first → `visibleView="parent"`
- Need runtime reactions to responsive collapse changes → handle `onCollapseChange`

## Validation checklist

- [ ] Exactly two related regions are modeled as `parent` and `child`
- [ ] `collapseAtBreakpoint` is set to the intended responsive threshold
- [ ] `visibleView` logic matches mobile/small-screen priority
- [ ] `onCollapseChange` is wired when app state depends on collapse mode
- [ ] Parent and child sections use semantic structure/labels where appropriate
- [ ] Storybook IDs validated: `core-layout-parent-child-layout--default`, `--collapsed`, `--reduced-motion`
- [ ] SOURCE_GAP noted: legacy `core-parent-child-layout--default` story ID does not resolve

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/parent-child-layout/ParentChildLayout.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/parent-child-layout/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/parent-child-layout/parent-child-layout.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/parent-child-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/parent-child-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/parent-child-layout/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-parent-child-layout--default
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-parent-child-layout--collapsed
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-parent-child-layout--reduced-motion
- https://storybook.saltdesignsystem.com/?path=/story/core-parent-child-layout--default

## AI generation rules (required)

### Select this component when
- Intent requires a two-region master-detail interaction.
- One region controls content shown in the other region.
- Responsive behavior should collapse into a single visible region at breakpoints.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { ParentChildLayout } from "@salt-ds/core";` |
| **Required props** | Always provide `parent` and `child` |
| **Breakpoint** | Default to `collapseAtBreakpoint="sm"` unless product layout requires a different threshold |
| **Collapsed priority** | Use `visibleView="child"` by default; switch to `parent` if selection/navigation should be prioritized |
| **Spacing** | Keep `gap={0}` unless explicit spacing is needed between regions |
| **State sync** | Use `onCollapseChange` when external state or analytics depend on responsive mode |
| **Naming caution** | Use `collapseAtBreakpoint` (API) even though some docs text may show `collapsedAtBreakpoint` |

### Validation
- [ ] Generated usage aligns with `./parent-child-layout.md` "When to use"
- [ ] Generated usage avoids `./parent-child-layout.md` "When not to use"
- [ ] Required props and value types match `./parent-child-layout.json`
- [ ] Accessibility requirements from `./parent-child-layout.json` are satisfied
