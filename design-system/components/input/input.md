# Input

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/input
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/input/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/input/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/input/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-input--default

## When to use

- To ask a subjective question where response length is likely to fit on a single line.
- In forms, search bars, and other places where short text entry is required.
- When you need single-line editing with optional adornments and validation states.

## When not to use

- When expected content is likely to exceed a single line; use `MultilineInput`.
- When field dimensions do not reflect expected input length (avoid overly wide/narrow fields for the data type).

## Accessibility intent

- Wrap `Input` in `FormField` to provide label, helper text, and validation messaging.
- Keyboard behavior follows standard textbox conventions (focus navigation, cursor movement, text editing).
- Avoid using placeholder text as instructions; placeholder disappears and does not meet instruction/contrast expectations.
- Do not rely on static adornments as labels because screen readers may not announce them as field labels.
- For empty read-only values, use `emptyReadOnlyMarker` to communicate intentional emptiness.

## Decision trees

### Input vs alternatives
- Need single-line text entry? → Use `Input`.
- Need multi-line freeform text? → Use `MultilineInput`.

### Field behavior choices
- Need controlled state? → Use `value` and `onChange`.
- Need uncontrolled state? → Use `defaultValue`.
- Need display-only value with copy capability? → Use `readOnly`.
- Need non-interactive field? → Use `disabled`.

### Visual and semantic choices
- Need visual hierarchy by surface context? → Choose `variant` (`primary`, `secondary`, `tertiary`).
- Need full boundary contrast? → Use `bordered`.
- Need embedded static or interactive content? → Use `startAdornment` and/or `endAdornment`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Input width reflects expected answer length
- [ ] Placeholder is not used as the only instruction/label
- [ ] FormField wrapper is used when label/helper/validation text is needed
- [ ] Controlled vs uncontrolled pattern is used consistently
- [ ] Read-only and disabled states are used intentionally

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/input
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/input/Input.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/input/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/input/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/input/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-input--default
- https://storybook.saltdesignsystem.com/?path=/story/core-input--controlled
- https://storybook.saltdesignsystem.com/?path=/story/core-input--variants
- https://storybook.saltdesignsystem.com/?path=/story/core-input--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-input--placeholder
- https://storybook.saltdesignsystem.com/?path=/story/core-input--readonly
- https://storybook.saltdesignsystem.com/?path=/story/core-input--empty-readonly-marker
- https://storybook.saltdesignsystem.com/?path=/story/core-input--text-alignment
- https://storybook.saltdesignsystem.com/?path=/story/core-input--validation
- https://storybook.saltdesignsystem.com/?path=/story/core-input--with-static-adornments
- https://storybook.saltdesignsystem.com/?path=/story/core-input--with-button-adornment
- https://storybook.saltdesignsystem.com/?path=/story/core-input--with-validation-and-adornments
- https://storybook.saltdesignsystem.com/?path=/story/core-input--spellcheck
- https://storybook.saltdesignsystem.com/?path=/story/core-input--bordered
- https://storybook.saltdesignsystem.com/?path=/story/core-input--with-form-field

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./input.md`
- Required behavior and constraints can be satisfied using props/states documented in `./input.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./input.json` |
| **State model** | Use `value` + `onChange` for controlled usage, or `defaultValue` for uncontrolled usage |
| **Wrapper** | Prefer composing with `FormField` when label/helper/validation messaging is needed |
| **Placeholder** | Use as hint/example only, not as the sole instruction |
| **Adornments** | Use start/end adornments for contextual cues or actions, not as labels |
| **Read-only empty** | Use `emptyReadOnlyMarker` to indicate intentional empty read-only values |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./input.json` |

### Validation
- [ ] Generated usage aligns with `./input.md` "When to use"
- [ ] Generated usage avoids `./input.md` "When not to use"
- [ ] Required props and value types match `./input.json`
- [ ] Accessibility requirements from `./input.json` are satisfied
