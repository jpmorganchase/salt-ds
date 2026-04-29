# Switch

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/switch
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/switch/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/switch/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/switch/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-switch--default

## When to use

- To present an instantaneous binary choice where updates apply immediately.
- To control a critical option that may involve downstream confirmation logic after toggling.
- When settings are naturally on/off and benefit from an inline, compact control.

## When not to use

- For selecting any number of independent options; use `Checkbox`.
- For single choice among mutually exclusive options; use `RadioButton`.
- For mutually exclusive visual state toggles requiring stronger prominence; use `ToggleButton`.
- For compact, dynamic groups of options; use selectable `Pill`.

## Accessibility intent

- Provide clear visible text or `aria-label` describing what the switch controls.
- Keyboard support: `Tab`/`Shift+Tab` for focus movement and `Space` for toggle.
- Prefer descriptive labels with outcome-oriented wording.
- Avoid read-only switch usage unless necessary; if used, make read-only status explicit in accessible naming.

## Decision trees

### When to use this component vs alternatives
- Use `Switch` for immediate on/off settings.
- Use `Checkbox` for multi-select lists and non-immediate form submissions.
- Use `RadioButton` for exactly-one selection in a set.

### Controlled vs uncontrolled
- Use `defaultChecked` for simple local state with no external synchronization.
- Use `checked` + `onChange` for controlled behavior and validation logic.

### Disabled vs read-only
- Use `disabled` when interaction and focus should both be blocked.
- Use `readOnly` only when state must not change but focus/description remain important.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Visual states meet design system standards

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/switch
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/switch/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/switch/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/switch/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-switch--default
- https://storybook.saltdesignsystem.com/?path=/story/core-switch--checked
- https://storybook.saltdesignsystem.com/?path=/story/core-switch--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-switch--disabled-checked
- https://storybook.saltdesignsystem.com/?path=/story/core-switch--controlled
- https://storybook.saltdesignsystem.com/?path=/story/core-switch--with-form-field
- https://storybook.saltdesignsystem.com/?path=/story/core-switch--readonly

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./switch.md`
- Required behavior and constraints can be satisfied using props/states documented in `./switch.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./switch.json` |
| **State model** | Use `defaultChecked` for uncontrolled; use `checked` + `onChange` for controlled behavior |
| **Labeling** | Prefer visible `label`; if omitted, provide an equivalent accessible name via input props |
| **Interactivity** | Use `disabled` to block interaction/focus; use `readOnly` only when focusable-but-non-editable behavior is required |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./switch.json` |

### Validation
- [ ] Generated usage aligns with `./switch.md` "When to use"
- [ ] Generated usage avoids `./switch.md` "When not to use"
- [ ] Required props and value types match `./switch.json`
- [ ] Accessibility requirements from `./switch.json` are satisfied