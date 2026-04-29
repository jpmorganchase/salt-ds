# Radio Button

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/radio-button
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/radio-button/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/radio-button/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/radio-button/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-radio-button--default

## When to use

- When users must select exactly one option from a small visible set.
- When you have fewer than five options and need single selection.
- When showing options side-by-side helps comparison and decision-making.

## When not to use

- For Boolean on/off choices; use `Switch`.
- For multi-select among a small set; use `CheckboxGroup`.
- For larger lists (more than five and fewer than 10); use `Dropdown`.
- For large option sets (more than 10); use `ComboBox`.

## Accessibility intent

- Group radios in `RadioButtonGroup`, which renders `role="radiogroup"` semantics.
- Tab focuses the checked option (or first option if none selected).
- Space checks the focused option.
- Arrow keys move focus and selection between options.
- Prefer group-level `readOnly`; standalone read-only radio usage is not considered accessible.

## Decision trees

### RadioButton vs alternatives
- Need exactly one selected option from visible choices → use `RadioButtonGroup`
- Need more than one selected option → use `CheckboxGroup`
- Need compact picker with hidden list for many options → use `Dropdown` or `ComboBox`
- Need a binary toggle → use `Switch`

### Group configuration
- Standard forms and vertical lists → `direction="vertical"` (default)
- Horizontal comparison of short options → `direction="horizontal"`
- Horizontal with many/long labels and viewport changes → `wrap={true}`
- Keep horizontal alignment while wrapping label text within each option → `wrap={false}`
- Need controlled selection → set group `value` and `onChange`
- Need uncontrolled initial selection → set group `defaultValue`

## Validation checklist

- [ ] Options are mutually exclusive and represent a single-choice question
- [ ] Group orientation (`direction`) matches layout and readability needs
- [ ] Group has accessible name via visible label or `aria-label` / `aria-labelledby`
- [ ] Keyboard interactions work (Tab, Space, Arrow keys)
- [ ] Validation state is set at group level when applicable
- [ ] Storybook IDs validated: `core-radio-button--default`, `--checked`, `--disabled`, `--readonly`
- [ ] Storybook IDs validated: `core-radio-button--vertical-group`, `--horizontal-group`, `--wrap-group`, `--controlled-group`
- [ ] SOURCE_GAP noted: legacy `core-radio-button-group--default` story ID does not resolve

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/radio-button/RadioButton.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/radio-button/RadioButtonGroup.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/radio-button/internal/RadioGroupContext.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/radio-button/radio-button.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/radio-button/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/radio-button/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/radio-button/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-radio-button--default
- https://storybook.saltdesignsystem.com/?path=/story/core-radio-button--vertical-group
- https://storybook.saltdesignsystem.com/?path=/story/core-radio-button-group--default

## AI generation rules (required)

### Select this component when
- The requirement is a single, mutually exclusive selection from visible options.
- Option count is small enough for direct display.
- Group semantics and keyboard arrow navigation are required.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { RadioButton, RadioButtonGroup } from "@salt-ds/core";` |
| **Grouping** | Render `RadioButton` controls inside one `RadioButtonGroup` for single-choice behavior |
| **Selection model** | Use `value` + `onChange` for controlled groups, `defaultValue` for uncontrolled |
| **Orientation** | Default to `direction="vertical"`; use `horizontal` only when labels remain legible |
| **Wrap behavior** | Keep `wrap=true` unless a design explicitly needs text-wrapping inside fixed horizontal items (`wrap=false`) |
| **Validation** | Apply `validationStatus` on `RadioButtonGroup` to propagate consistent state styling |

### Validation
- [ ] Generated usage aligns with `./radio-button.md` "When to use"
- [ ] Generated usage avoids `./radio-button.md` "When not to use"
- [ ] Required props and value types match `./radio-button.json`
- [ ] Accessibility requirements from `./radio-button.json` are satisfied