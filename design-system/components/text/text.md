# Text

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/text
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/text/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/text/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/text/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-text--text-playground
- SOURCE_GAP: Storybook ID `core-text--default` does not resolve

## When to use

- For body copy, labels, notation, and emphasis text that should follow Salt typography tokens.
- For semantic headings using `H1`..`H4` and display typography using `Display1`..`Display4`.
- When visual style and semantic element differ by combining `as` and `styleAs`.
- When long text requires line clamping via `maxRows`, paired with an affordance to reveal full content.

## When not to use

- For interactive text controls where dedicated components exist (for example links/buttons).
- For plain HTML typography in Salt UIs; use Salt text primitives instead of raw heading/paragraph styling.
- For truncation without a path to full content; avoid inaccessible clipping.

## Accessibility intent

- Preserve semantic structure with heading elements (`H1`..`H4` or `as` overrides).
- Keep heading levels sequential and meaningful for assistive navigation.
- Treat truncated text as a visual affordance only; provide full-text access through tooltip or expansion.

## Decision trees

### Choosing text primitives
- Use `Text` for body paragraphs and supporting copy.
- Use `H1`..`H4` for document hierarchy headings.
- Use `Display1`..`Display4` for prominent display styles.
- Use `Label`, `TextNotation`, `TextAction`, and `Code` for their specific typography semantics.

### Choosing semantic vs visual control
- If semantics are correct and only appearance must change, use `styleAs`.
- If semantics must change, use `as` (or a dedicated heading/display component).
- If both semantic level and appearance differ, combine `as` and `styleAs` intentionally.

### Choosing color and truncation behavior
- Use `color="primary"` for default emphasis and `color="secondary"` for supporting text.
- Use status colors (`info`, `error`, `warning`, `success`) when the text conveys status context.
- Use `maxRows` only when layout requires truncation and full content remains reachable.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Truncated content has a full-text access path
- [ ] Heading hierarchy is semantic and not skipped

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/text
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/text/Text.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/text/Text.css
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/text/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/text/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/text/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/text/text.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-text--text-playground
- https://storybook.saltdesignsystem.com/?path=/story/core-text--primary
- https://storybook.saltdesignsystem.com/?path=/story/core-text--secondary
- https://storybook.saltdesignsystem.com/?path=/story/core-text--info
- https://storybook.saltdesignsystem.com/?path=/story/core-text--error
- https://storybook.saltdesignsystem.com/?path=/story/core-text--warning
- https://storybook.saltdesignsystem.com/?path=/story/core-text--success
- https://storybook.saltdesignsystem.com/?path=/story/core-text--inherit-color
- https://storybook.saltdesignsystem.com/?path=/story/core-text--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-text--strong
- https://storybook.saltdesignsystem.com/?path=/story/core-text--small
- https://storybook.saltdesignsystem.com/?path=/story/core-text--style-as
- https://storybook.saltdesignsystem.com/?path=/story/core-text--truncation
- https://storybook.saltdesignsystem.com/?path=/story/core-text--display
- https://storybook.saltdesignsystem.com/?path=/story/core-text--headings
- https://storybook.saltdesignsystem.com/?path=/story/core-text--label
- https://storybook.saltdesignsystem.com/?path=/story/core-text--notation
- https://storybook.saltdesignsystem.com/?path=/story/core-text--action
- https://storybook.saltdesignsystem.com/?path=/story/core-text--code

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./text.md`
- Required behavior and constraints can be satisfied using props/states documented in `./text.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./text.json` |
| **Component choice** | Choose `Text`, heading, display, or alias component based on content role |
| **Semantics** | Prefer dedicated heading components; use `as` only when needed |
| **Visual style** | Use `styleAs` only for visual remapping, not semantic correction |
| **Truncation** | When using `maxRows`, add a full-text reveal pattern |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./text.json` |

### Validation
- [ ] Generated usage aligns with `./text.md` "When to use"
- [ ] Generated usage avoids `./text.md` "When not to use"
- [ ] Required props and value types match `./text.json`
- [ ] Accessibility requirements from `./text.json` are satisfied