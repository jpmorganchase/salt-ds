# Multiline Input

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/multiline-input
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/multiline-input/MultilineInput.tsx
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/multiline-input/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/multiline-input/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/multiline-input/accessibility.mdx
- Storybook:
  - https://storybook.saltdesignsystem.com/?path=/story/core-multiline-input--default
  - https://storybook.saltdesignsystem.com/?path=/story/core-multiline-input--with-form-field
  - https://storybook.saltdesignsystem.com/?path=/story/core-multiline-input--with-adornments
- Stories source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/multiline-input/multiline-input.stories.tsx
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/multiline-input/MultilineInput.cy.tsx

## When to use

- When asking a subjective question where the answer length is unknown.
- When users need space to write, review, and edit longer text content.
- When a single-line input is likely to be too restrictive for the expected response.

## When not to use

- If expected input is unlikely to exceed one line, use `Input`.
- Do not use placeholder text as the only source of instructions or contextual help.

## Accessibility intent

- Prefer wrapping `MultilineInput` in `FormField` to provide visible label, helper text, and validation messaging.
- Ensure field labeling and description are exposed for assistive technologies.
- Keep disabled/read-only behavior consistent for nested interactive adornments.

## Decision trees

### MultilineInput vs alternatives
- Need short, single-line values? → Use `Input`.
- Need multi-line freeform narrative text? → Use `MultilineInput`.

### Size and layout
- Unknown response length? → Start with default rows (`3`) and allow growth.
- Predictably larger responses? → Increase `rows` to fit expected content.
- Need bounded visible area? → Constrain with max-height and allow scrolling.

### State and feedback
- Input locked but still copyable? → Use `readOnly`.
- Input unavailable and non-focusable? → Use `disabled`.
- Validation feedback required? → Set `validationStatus` and provide helper/status messaging via `FormField`.

### Adornments
- Need contextual unit/symbol or lightweight utility control? → Use `startAdornment`/`endAdornment`.
- If input is `disabled` or `readOnly`, ensure interactive adornments match that state.

## Validation checklist

- [ ] Usage matches "When to use" guidance
- [ ] Not used for single-line-only entry scenarios
- [ ] `rows` reflects expected content volume
- [ ] Controlled/uncontrolled value pattern is used consistently
- [ ] Placeholder is not used as primary instruction text
- [ ] `FormField` labeling/helper text provided where needed
- [ ] Read-only/disabled state behavior is consistent for adornments
- [ ] Validation state and messaging are coherent

## Primary references

- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/multiline-input/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/multiline-input/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/multiline-input/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/multiline-input/MultilineInput.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/multiline-input/multiline-input.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/multiline-input/MultilineInput.cy.tsx

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./multiline-input.md`
- Required behavior and constraints can be satisfied using props/states documented in `./multiline-input.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./multiline-input.json` |
| **State model** | Use either controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) pattern consistently |
| **Sizing** | Keep default rows unless intent clearly requires more visible lines |
| **Accessibility** | Prefer `FormField` composition for label/help/error messaging |
| **Adornments** | Use adornments only when they add context or utility; disable adornment controls in disabled/read-only states |
| **Validation** | Apply `validationStatus` only when paired with clear user feedback |

### Validation
- [ ] Generated usage aligns with `./multiline-input.md` "When to use"
- [ ] Generated usage avoids `./multiline-input.md` "When not to use"
- [ ] Required props and value types match `./multiline-input.json`
- [ ] Accessibility requirements from `./multiline-input.json` are satisfied
