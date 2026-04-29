# FormField

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/form-field
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/form-field/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/form-field/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/form-field/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-form-field--default

## When to use

- Use as the wrapper for editable form controls so labels, helper text, and validation messaging are consistently wired.
- Use `FormFieldLabel` and `FormFieldHelperText` inside the field for accessible labeling and descriptive guidance.
- Use in simple forms, filter panels, and data-entry tickets where controls need shared field-level state.
- Align field width and placement with layout grid constraints for the target density/viewport.

## When not to use

- SOURCE_GAP: usage docs do not provide an explicit “when not to use” section.

## Accessibility intent

- Keyboard interactions come from the wrapped control, not `FormField` itself.
- Label/helper associations are provided through form-field context ids consumed by compatible controls.
- Apply `disabled`, `readOnly`, `necessity`, and `validationStatus` at `FormField` level for consistent semantics.
- Use visible labels and helper text to satisfy descriptive and feedback requirements.

## Decision trees

### FormField vs direct control usage
- Need a labeled control with helper/validation message wiring? → Use `FormField`.
- Need bare interactive control with no field metadata? → Direct control usage may be acceptable.

### Label and helper composition
- Need a standard concise label? → `FormFieldLabel` with default `intent="label"`.
- Need question/sentence style prompt? → Set `FormFieldLabel intent="sentence"`.
- Need inline guidance or error detail? → Add `FormFieldHelperText`.

### State application
- Disable interaction due to context or permissions? → Set `disabled` on `FormField`.
- Show fixed but relevant value? → Set `readOnly` on `FormField`.
- Show critical/potential/success feedback? → Set `validationStatus` to `error`/`warning`/`success`.
- Mark requirement semantics? → Use `necessity` (`required`/`optional`/`asterisk`).

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Field-level state props are set on `FormField`, not duplicated on child control
- [ ] `FormFieldLabel` is present for user-facing fields
- [ ] `FormFieldHelperText` is used when additional guidance or validation detail is needed
- [ ] Wrapped control reflects disabled/read-only/validation context correctly
- [ ] Accessibility requirements from `./form-field.json` are satisfied

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/form-field
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/form-field/FormField.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/form-field/FormFieldLabel.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/form-field/FormFieldHelperText.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/form-field/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/form-field/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/form-field/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-form-field--default
- https://storybook.saltdesignsystem.com/?path=/story/core-form-field--with-validation
- https://storybook.saltdesignsystem.com/?path=/story/core-form-field--necessity-label
- https://storybook.saltdesignsystem.com/?path=/story/core-form-field--grouped-with-label-top

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./form-field.md`
- Required behavior and constraints can be satisfied using props/states documented in `./form-field.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./form-field.json` |
| **Structure** | Compose as `FormFieldLabel` + control + optional `FormFieldHelperText` |
| **State source** | Apply `disabled`, `readOnly`, `necessity`, and `validationStatus` on `FormField` |
| **Layout** | Use `labelPlacement` (`top`/`left`/`right`) to match form density/layout constraints |
| **Accessibility** | Rely on FormField context wiring; avoid duplicate manual ARIA wiring unless required |

### Validation
- [ ] Generated usage aligns with `./form-field.md` "When to use"
- [ ] Required props and value types match `./form-field.json`
- [ ] Accessibility requirements from `./form-field.json` are satisfied