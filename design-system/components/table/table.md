# Table

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/table
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/table/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/table/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/table/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-table--primary
- SOURCE_GAP: Storybook ID `core-table--default` does not resolve

## When to use

- When you need to present simple data in a structured table format.
- When semantic table markup (`table`, `thead`, `tbody`, `th`, `td`) improves readability and accessibility.
- When row/column relationships are important and do not require advanced grid features.

## When not to use

- When data is complex or requires rich interactivity (sorting, filtering, virtualization, column pinning); use Data Grid (`ag-grid-theme`).

## Accessibility intent

- Provide a table accessible name with `<caption>` (preferred), or `aria-label` / `aria-labelledby`.
- `TableContainer` creates a keyboard-focusable region only when overflow exists, supporting reflow and keyboard access.
- Expect verbose initial announcements for some screen reader/browser combinations; this is a known tradeoff for guaranteed naming compliance.
- Keep numeric values right-aligned (`textAlign="right"`) for scanability.

## Decision trees

### When to use this component vs alternatives
- Use `Table` for simple, semantic tabular display.
- Use `ag-grid-theme` for complex data grids and advanced interactions.

### Variant and divider decisions
- Use `variant` (`primary`/`secondary`/`tertiary`) to match surrounding surface hierarchy.
- Use `divider` variants to tune visual separation density; use `none` for minimal separation.

### Container and labeling decisions
- Wrap with `TableContainer` when overflow is possible at narrow widths.
- Use `<caption>` for intrinsic labeling; use `aria-label` / `aria-labelledby` overrides only when required by layout.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Visual states meet design system standards

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/table
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/table/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/table/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/table/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-table--primary
- https://storybook.saltdesignsystem.com/?path=/story/core-table--secondary
- https://storybook.saltdesignsystem.com/?path=/story/core-table--tertiary
- https://storybook.saltdesignsystem.com/?path=/story/core-table--zebra
- https://storybook.saltdesignsystem.com/?path=/story/core-table--header-variant
- https://storybook.saltdesignsystem.com/?path=/story/core-table--footer-variant
- https://storybook.saltdesignsystem.com/?path=/story/core-table--sticky-header-footer
- https://storybook.saltdesignsystem.com/?path=/story/core-table--column-headers
- https://storybook.saltdesignsystem.com/?path=/story/core-table--long-cell-content
- https://storybook.saltdesignsystem.com/?path=/story/core-table--numerical-data
- https://storybook.saltdesignsystem.com/?path=/story/core-table--scrollable-vertically
- https://storybook.saltdesignsystem.com/?path=/story/core-table--scrollable-aria-label-table
- https://storybook.saltdesignsystem.com/?path=/story/core-table--scrollable-external-label-table
- https://storybook.saltdesignsystem.com/?path=/story/core-table--scrollable-id-override
- https://storybook.saltdesignsystem.com/?path=/story/core-table--scrollable-aria-labelled-by-override
- https://storybook.saltdesignsystem.com/?path=/story/core-table--scrollable-container-aria-label-override

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./table.md`
- Required behavior and constraints can be satisfied using props/states documented in `./table.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./table.json` |
| **Structure** | Compose semantic table sections using `THead`, `TBody`, `TR`, `TH`, `TD`, and optional `TFoot` |
| **Varianting** | Start with `variant="primary"`, add `divider` and `zebra` only when readability requires it |
| **Container** | Use `TableContainer` when overflow may occur to preserve reflow and keyboard accessibility |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./table.json` |

### Validation
- [ ] Generated usage aligns with `./table.md` "When to use"
- [ ] Generated usage avoids `./table.md` "When not to use"
- [ ] Required props and value types match `./table.json`
- [ ] Accessibility requirements from `./table.json` are satisfied