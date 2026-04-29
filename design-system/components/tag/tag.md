# Tag

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/tag
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tag/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tag/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tag/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-tag--primary
- SOURCE_GAP: Storybook ID `core-tag--default` does not resolve

## When to use

- For displaying categories in a catalogue or grouped content.
- To display non-interactive metadata on a page.
- When short labels (typically one to two words) help contextualize nearby content.

## When not to use

- For quick filtering/selection interactions; use `Pill`.
- For compact counts or notification values; use `Badge`.

## Accessibility intent

- Do not rely on color alone for meaning; text and/or icons should convey category.
- Use concise, descriptive labels in sentence case.
- Keep tags visually associated with the content they describe.

## Decision trees

### When to use this component vs alternatives
- Use `Tag` for read-only categorization metadata.
- Use `Pill` when users need to interactively filter/select.
- Use `Badge` for numeric or compact status/count indicators.

### Variant and category decisions
- Use `variant="primary"` as the default.
- Use `variant="secondary"` for stronger emphasis contrast.
- Use `category` values `1..20` for categorical color systems; out-of-range values fall back to category `1`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Visual states meet design system standards

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/tag
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tag/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tag/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/tag/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-tag--primary
- https://storybook.saltdesignsystem.com/?path=/story/core-tag--secondary
- https://storybook.saltdesignsystem.com/?path=/story/core-tag--bordered
- https://storybook.saltdesignsystem.com/?path=/story/core-tag--category

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./tag.md`
- Required behavior and constraints can be satisfied using props/states documented in `./tag.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./tag.json` |
| **Variant** | Default to `variant="primary"`; use `secondary` when stronger contrast is needed |
| **Category** | Use `category` in the `1..20` range for categorical color systems |
| **Content** | Keep labels short, meaningful, and non-interactive |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./tag.json` |

### Validation
- [ ] Generated usage aligns with `./tag.md` "When to use"
- [ ] Generated usage avoids `./tag.md` "When not to use"
- [ ] Required props and value types match `./tag.json`
- [ ] Accessibility requirements from `./tag.json` are satisfied