# Border Layout

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/border-layout
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/border-layout/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/border-layout/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/border-layout/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-border-layout--all-panels

## When to use

- To manage the top-level layout of your application or page with at least one additional region alongside the main content area.

## When not to use

- Don’t use when you’re laying out content inside one of the five border regions rather than defining top-level page structure.
- Don’t use for custom two-dimensional dashboards where both rows and columns need flexible control; use `GridLayout` instead.
- Don’t use for temporary side content reveal patterns; use `Drawer` instead.

## Decision trees

### When to use this component vs alternatives
- Need a five-region page shell (`north`, `west`, `center`, `east`, `south`) with required center content → Use `BorderLayout` with `BorderItem` children.
- Need custom row/column placement independent of border regions → Use `GridLayout`.
- Need a temporary side panel that overlays or slides in → Use `Drawer`.

### When to use each variant/state
- `gap`: Use to apply the same spacing multiplier between rows and columns.
- `columnGap` / `rowGap`: Use when spacing differs by dimension.
- Region visibility: Include any combination of `BorderItem` regions, but keep `center` present.
- `sticky` on `BorderItem`: Keep a region pinned while surrounding content scrolls.
- `padding` / `margin`: Control inner and outer spacing (defaults are `0`).

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `BorderLayout` includes a `center` region and at least one additional region
- [ ] Region placement uses valid `BorderItem` positions (`north`, `west`, `center`, `east`, `south`)
- [ ] Spacing props (`gap`, `columnGap`, `rowGap`, `padding`, `margin`) match intended layout behavior
- [ ] Semantic HTML is applied with `as` for layout landmarks when needed

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./border-layout.md`
- Required behavior and constraints can be satisfied using props/states documented in `./border-layout.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./border-layout.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./border-layout.json` |

### Validation
- [ ] Generated usage aligns with `./border-layout.md` "When to use"
- [ ] Generated usage avoids `./border-layout.md` "When not to use"
- [ ] Required props and value types match `./border-layout.json`
- [ ] Accessibility requirements from `./border-layout.json` are satisfied

## Accessibility intent

- Use semantic HTML for page-layout regions.
- Prefer the `as` prop on `BorderLayout` / `BorderItem` to render meaningful elements (for example, `nav`) instead of generic `div` containers.

## Notes

- Source-of-truth docs were reorganized under `site/docs/components/layouts/border-layout/*`.
- Storybook stories are discoverable under `core-layout-border-layout--*`; required validation pattern `core-border-layout--*` does not currently resolve.

## Sync status

- Synced to current upstream code/docs/examples/accessibility sources with dual-pass verification.

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/border-layout
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/border-layout/BorderLayout.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/border-layout/index.ts
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/border-item
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/border-item/BorderItem.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/border-layout/border-layout.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/border-item/border-item.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/border-layout/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/border-layout/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/layouts/border-layout/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-border-layout--all-panels
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-border-layout--no-right-panel
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-border-layout--no-left-panel
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-border-layout--no-header
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-border-layout--fixed-panels