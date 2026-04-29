# Border Item

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/border-item
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/border-item/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/border-item/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/border-item/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-layout-border-layout-border-item--border-item-wrapper

## When to use
- Use to place content in a specific BorderLayout region via `position` (`north`, `west`, `center`, `east`, `south`).
- Use when you need per-region alignment controls through `horizontalAlignment` and `verticalAlignment`.
- Use when a region should remain visible while neighboring content scrolls by setting `sticky`.
- Use `margin` and `padding` responsive props when BorderLayout regions need explicit inner or outer spacing.

## When not to use
- Don't use as a standalone page layout container; use `BorderLayout` as the parent layout.
- Don't use when content has no region semantics; prefer simpler layout primitives when fixed border regions are unnecessary.

## Decision trees

### When to use this component vs alternatives
- Need top-level five-region page structure (north/west/center/east/south) → Use `BorderLayout` with `BorderItem` children.
- Need generic row/column/stack layout without border regions → Use another layout primitive instead of `BorderItem`.

### When to use each variant/state
- `position="north" | "west" | "center" | "east" | "south"`: Select the region where content must render.
- `sticky={true}`: Keep a region pinned while adjacent regions continue scrolling.
- `horizontalAlignment` / `verticalAlignment`: Align content within a region when default stretch behavior is not desired.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required `position` prop is provided and uses a supported value
- [ ] `sticky`, `margin`, `padding`, and alignment props are used only when needed
- [ ] Accessibility impact is inherited from child content (no unsourced role/keyboard assumptions)
- [ ] Visual states meet design system standards

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./border-item.md`
- Required behavior and constraints can be satisfied using props/states documented in `./border-item.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./border-item.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./border-item.json` |

### Validation
- [ ] Generated usage aligns with `./border-item.md` "When to use"
- [ ] Generated usage avoids `./border-item.md` "When not to use"
- [ ] Required props and value types match `./border-item.json`
- [ ] Accessibility requirements from `./border-item.json` are satisfied

## Accessibility intent

- SOURCE_GAP: `site/docs/components/border-item/accessibility.mdx` is unavailable (404), so no component-specific keyboard or ARIA guidance is documented upstream.
- `BorderItem` renders layout content through `GridItem`; accessibility semantics depend on the child content and chosen element (`as`).

## Notes

- SOURCE_GAP: `usage.mdx` and `examples.mdx` for `border-item` are unavailable in the expected docs path (404).
- Storybook has a discoverable story (`core-layout-border-layout-border-item--border-item-wrapper`), but required pattern checks `core-border-item--default` and `core-border-item--border-item-wrapper` do not resolve.

## Sync status

- API and story evidence updated from upstream code and Storybook verification (dual-pass consistent).

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/border-item
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/border-item/BorderItem.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/border-item/BorderItem.css
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/border-item/index.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/border-item/border-item.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/border-layout/border-layout.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/border-layout/index.ts
- https://storybook.saltdesignsystem.com/?path=/story/core-layout-border-layout-border-item--border-item-wrapper