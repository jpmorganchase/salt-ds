# Combo Box

## Source of truth

- Core source: [ComboBox/Option/OptionGroup source](https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/combo-box)
- Usage docs: [ComboBox usage guidance](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/combo-box/usage.mdx)
- Examples docs: [ComboBox examples](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/combo-box/examples.mdx)
- Accessibility docs: [ComboBox accessibility](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/combo-box/accessibility.mdx)
- Storybook: [ComboBox default story](https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--default)

## When to use

Use **ComboBox** when:
- You need to display and select from a **list of 10 or more options** with filtering
- Quick narrowing down of available options is beneficial
- Only the selected value needs to be visible (not the full list)
- You have **100+ options** and want to prevent performance issues via filtering
- Users need to work with large datasets efficiently

## When not to use

- **Instead of Dropdown:** For 5-10 options without filtering, use [Dropdown](../dropdown) instead
- **Instead of RadioButtonGroup:** For single selection from <5 options, use [RadioButtonGroup](../radio-button) instead
- **Instead of CheckboxGroup:** For multi-select from <5 options, use [CheckboxGroup](../checkbox) instead
- **Instead of Switch:** For binary choices (on/off), use [Switch](../switch) instead

## Accessibility intent

- Use a visible label via FormField or provide `aria-label` when no visible label exists
- ComboBox uses `role="combobox"`; in read-only mode role changes to `textbox`
- Keyboard interactions must support Tab/Shift+Tab, Enter, Space, Escape, Arrow keys, Home/End, and Page Up/Down
- In multi-select mode, Left/Right arrows move focus between input and pills
- Placeholder text should not contain instructional help text; use helper text for instructions
- Safari + VoiceOver on macOS 14 has known focus-management limitations; use updated OS/browser combinations when possible

## Modes and control patterns

### Selection modes
- **Single-select (default):** Only one option can be selected; selected value displays in input
- **Multi-select:** When `multiselect={true}`, multiple selections display as pills/tokens in input

### State management
- **Uncontrolled (default):** Use `defaultValue` and `defaultSelected` for initial state
- **Controlled:** Use `value` and `selected` props with `onSelectionChange` callback for external control

### States
- **Focused:** Input has visible cursor; list opens automatically
- **Disabled:** Entire ComboBox is non-interactive
- **Read-only:** User can view but not edit selection; ComboBox's role changes to "textbox" for screen reader compatibility
- **Disabled option:** Individual options can be disabled with `disabled` prop on Option

## Variants and customization

### Visual variants
- **Primary (default):** Standard styling
- **Secondary:** Alternative background color
- **Tertiary:** Minimal styling

### Features
- **Grouped options:** Use OptionGroup to organize related options
- **Complex options:** Render rich content (icons, descriptions) within Option
- **Custom filtering:** Implement custom filter logic via props
- **Object values:** Use `valueToString` prop to convert complex values to display strings
- **Empty message:** Display message when no options match filter
- **Free text entry:** Allow users to enter values not in predefined list
- **Truncation:** Multi-select pills can truncate with `truncate={true}`
- **Select on Tab:** With `selectOnTab={true}`, Tab key selects current active option
- **Clear button:** Add a clear/reset button via `endAdornment` prop
- **Bordered:** Use `bordered={true}` for full border styling

## Decision trees

```
Need filtering for 10+ options?
├─ Yes → Use ComboBox
└─ No → Use Dropdown (or RadioButtonGroup/CheckboxGroup for very small sets)

Need multiple selections?
├─ Yes → Use ComboBox with multiselect={true}
└─ No → Use single-select ComboBox (default)

Need external form state control?
├─ Yes → Use controlled props (value/selected/open + handlers)
└─ No → Use uncontrolled defaults (defaultValue/defaultSelected/defaultOpen)
```

### Validation
- **Error:** `validationStatus="error"` highlights critical issues
- **Warning:** `validationStatus="warning"` highlights non-critical issues
- **Success:** `validationStatus="success"` (available but no visual styling)

## Validation checklist

- [ ] Correct selection mode (single vs multi-select) for use case
- [ ] Appropriate control method (uncontrolled vs controlled)
- [ ] Keyboard navigation works: Tab, Shift+Tab, Enter/Space, Escape, Arrow keys, Home/End, Page Up/Down
- [ ] Filtering/search works as expected
- [ ] ARIA attributes properly set (role, aria-expanded, aria-controls, aria-labelledby, aria-multiselectable)
- [ ] Placeholder text provides example or instruction (not WCAG-violating contextual help)
- [ ] FormField wrapping includes label and helper text where applicable

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/combo-box
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/combo-box/ComboBox.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/combo-box/useComboBox.ts
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/option/Option.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/option/OptionGroup.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/combo-box/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/combo-box/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/combo-box/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--default
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--placeholder
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--with-default-selected
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--readonly
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--readonly-empty
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--disabled-option
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--variants
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--multiselect
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--with-form-field
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--grouped
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--complex-option
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--long-list
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--empty-message
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--validation
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--custom-filtering
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--object-value
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--multiple-pills
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--multiple-pills-truncated
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--free-text
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--select-on-tab
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--clear-selection
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--bordered
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--virtualized
- https://storybook.saltdesignsystem.com/?path=/story/core-combo-box--performance-test (SOURCE_GAP: fetch extraction failed during audit)

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./combo-box.md`
- Required behavior and constraints can be satisfied using props/states documented in `./combo-box.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./combo-box.json` |
| **Selection mode** | Use `multiselect={true}` for multi-select; omit for single-select (default) |
| **Control pattern** | Use `defaultSelected` / `defaultValue` for uncontrolled; use `selected` / `value` + `onSelectionChange` for controlled |
| **Options** | Wrap in Option components (or OptionGroup for grouped sets) |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply keyboard, ARIA, and placeholder guidance from `./combo-box.json` |

### Validation
- [ ] Generated usage aligns with `./combo-box.md` "When to use"
- [ ] Generated usage avoids `./combo-box.md` "When not to use"
- [ ] Required props and value types match `./combo-box.json`
- [ ] Keyboard interaction pattern correct: Tab (focus), Enter/Space (select), Escape (close), Arrow keys (navigate), Home/End, Page Up/Down
- [ ] ARIA attributes present: role="combobox", aria-expanded, aria-controls, aria-multiselectable (if multi)