# Divider

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/divider
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/divider/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/divider/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/divider/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-divider--variants (`SOURCE_GAP`: `core-divider--default` does not resolve)

## When to use

- To provide visual separation between elements, regions and containers.
- To separate interactive elements or distinct interactions using `variant="primary"`.
- To separate regions/containers with lower emphasis using `variant="secondary"` or `variant="tertiary"`.
- To separate items in vertical layouts by setting `orientation="vertical"`.

## When not to use

- To group options or items inside `ComboBox`, `Dropdown`, or `Menu`; use `OptionGroup` or `MenuGroup` instead.
- As a replacement for semantic grouping structure; use meaningful containers/sections when hierarchy is required.

## Accessibility intent

- Divider renders with `role="separator"` and sets `aria-orientation` based on `orientation`.
- For decorative separators that should not be announced by assistive technology, set `aria-hidden="true"`.
- Divider is non-interactive and does not require keyboard interaction.

## Decision trees

### Divider vs grouped option components
- Need visual separation between general UI regions/elements? → Use `Divider`.
- Need grouped options in pickers/menus? → Use `OptionGroup` or `MenuGroup` (not `Divider`).

### Variant selection
- Need strongest separation or interactive region boundaries? → `variant="primary"`.
- Need region/container separation with lower visual emphasis? → `variant="secondary"`.
- Need subtle repeated-item separation? → `variant="tertiary"`.

### Orientation selection
- Separating stacked content (top-to-bottom)? → `orientation="horizontal"` (default).
- Separating side-by-side content (left-to-right)? → `orientation="vertical"` and provide explicit height.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `orientation` is correct for layout direction and defaults are relied on intentionally
- [ ] `variant` reflects intended visual emphasis (`primary`, `secondary`, `tertiary`)
- [ ] Decorative dividers use `aria-hidden="true"` where appropriate
- [ ] Divider is not used to group options in ComboBox/Dropdown/Menu
- [ ] Visual separator contrast/emphasis is appropriate for context

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/divider
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/divider/Divider.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/divider/index.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/divider/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/divider/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/divider/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/divider/divider.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-divider--variants
- https://storybook.saltdesignsystem.com/?path=/story/core-divider--vertical

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./divider.md`
- Required behavior and constraints can be satisfied using props/states documented in `./divider.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./divider.json` |
| **Orientation** | Use horizontal by default; set `orientation="vertical"` only for side-by-side content separation |
| **Variant** | Default to `primary`; downgrade to `secondary`/`tertiary` when softer separation is needed |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Preserve separator semantics and use `aria-hidden="true"` for decorative-only usage |

### Validation
- [ ] Generated usage aligns with `./divider.md` "When to use"
- [ ] Generated usage avoids `./divider.md` "When not to use"
- [ ] Required props and value types match `./divider.json`
- [ ] Accessibility requirements from `./divider.json` are satisfied
- [ ] Decorative-only usage includes `aria-hidden="true"`