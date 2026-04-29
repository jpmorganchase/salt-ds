# Dropdown

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/dropdown
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dropdown/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dropdown/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dropdown/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--default

## When to use

- When a user needs the ability to choose one value from a set of five to 10 options.
- When only the selected value from a set of options needs to remain visible after selection.
- When users need multi-select from a bounded list without free-text filtering.

## When not to use

- When there are more than 10 options and users need filtering to find values; use `ComboBox`.
- When there are fewer than five options and exactly one must be selected; use `RadioButtonGroup`.
- When there are fewer than five options and multiple selections are needed; use `CheckboxGroup`.
- For boolean on/off choices; use `Switch`.
- For very large lists (for example >100 items) without virtualization/filtering.

## Accessibility intent

- Dropdown uses combobox/listbox semantics with option-level keyboard navigation.
- Ensure each dropdown has an accessible label (for example via `FormFieldLabel` or ARIA labeling props).
- Support keyboard controls for open/close, option navigation, and selection.
- In multi-select mode, selection does not auto-close the list.
- If read-only behavior is used, provide clear labeling/context because screen reader support may vary.

## Decision trees

### Dropdown vs alternatives
- Need select-only choice from a compact list with selected value shown in trigger? → Use `Dropdown`.
- Need filtering/search among larger datasets? → Use `ComboBox`.
- Need always-visible options with few choices? → Use `RadioButtonGroup` or `CheckboxGroup`.
- Need binary toggle behavior? → Use `Switch`.

### Selection and control model
- Single value only? → Default single-select.
- Multiple values? → Set `multiselect`.
- Need to manage selection/open state from app logic? → Use controlled props (`selected`/`open`) with change handlers.
- Need initial value/open state only? → Use uncontrolled defaults (`defaultSelected`/`defaultOpen`).

### Visual and state choices
- Use `variant="primary"` by default; switch to `secondary`/`tertiary` to match surrounding surfaces.
- Use `bordered` when trigger fill color matches the background.
- Use `validationStatus` only when tied to form validation feedback.
- Use `readOnly` for visible but immutable values; use `disabled` when interaction must be unavailable.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Selection model (single/multi and controlled/uncontrolled) matches requirements
- [ ] `Option`/`OptionGroup` children are used correctly and values are stable
- [ ] `valueToString` is provided when option values are non-string or display text differs
- [ ] Accessible labeling and keyboard behavior are preserved
- [ ] Disabled/read-only/validation states are intentional and communicated

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/dropdown
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/dropdown/Dropdown.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/list-control/ListControlState.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/option/Option.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/option/OptionGroup.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dropdown/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dropdown/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dropdown/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--default
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--placeholder
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--with-default-selected
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--readonly
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--disabled-option
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--variants
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--multiselect
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--with-form-field
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--grouped
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--complex-option
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--long-list
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--custom-value
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--validation
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--with-start-adornment
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--object-value
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--select-all
- https://storybook.saltdesignsystem.com/?path=/story/core-dropdown--bordered

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./dropdown.md`
- Required behavior and constraints can be satisfied using props/states documented in `./dropdown.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./dropdown.json` |
| **Options** | Supply `Option` children (and `OptionGroup` only when grouping is required) |
| **Selection model** | Choose single-select by default; enable `multiselect` only when explicitly needed |
| **Control mode** | Use uncontrolled defaults first; switch to controlled model only when parent state orchestration is required |
| **Display text** | Add `valueToString` when option values are objects or differ from displayed text |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./dropdown.json` |

### Validation
- [ ] Generated usage aligns with `./dropdown.md` "When to use"
- [ ] Generated usage avoids `./dropdown.md` "When not to use"
- [ ] Required props and value types match `./dropdown.json`
- [ ] Accessibility requirements from `./dropdown.json` are satisfied