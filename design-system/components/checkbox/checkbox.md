# Checkbox

## Source of truth

- Core source: [Checkbox/CheckboxGroup source](https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/checkbox)
- Usage docs: [Checkbox usage guidance](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/checkbox/usage.mdx)
- Examples docs: [Checkbox examples](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/checkbox/examples.mdx)
- Accessibility docs: [Checkbox accessibility](https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/checkbox/accessibility.mdx)
- Storybook: [Checkbox default story](https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--default)

## When to use

Use **Checkbox** when:
- To present an **independent choice** that the user can select or deselect
- To present a **list of independent options** where the user can select any number of choices

Use **CheckboxGroup** when:
- You need to group multiple checkboxes together as a logical unit
- You want to manage checked state across multiple checkboxes
- You need direction control (vertical/horizontal) or text wrapping behavior

## When not to use

- **Instead of RadioButton:** When the choice is mutually exclusive between two or more options, use [RadioButton](../radio-button) instead
- **Instead of Switch:** To display a single option but trigger a state change directly and immediately, use [Switch](../switch) instead
- **For form labels:** Use FormField component to wrap CheckboxGroup for proper label and validation messaging

## Accessibility intent

Checkboxes require explicit ARIA marking and keyboard support:
- Every checkbox must have a visible text label via the `label` prop or an `aria-label` attribute
- Checkbox role is automatically applied; group role is applied to CheckboxGroup
- Keyboard focus and Space bar toggling must work without JavaScript errors
- Indeterminate state (`indeterminate={true}`) is managed internally and reflected in both CSS and aria-checked state
- CheckboxGroup integration with FormField provides proper label-input associations for accessibility

## Decision trees

```
Need to group related checkboxes?
├─ Yes → Use CheckboxGroup with Checkbox children
└─ No → Use standalone Checkbox

Within a form?
├─ Yes → Wrap CheckboxGroup in FormField for label/validation
└─ No → Use CheckboxGroup directly

Multiple possible selections needed?
├─ Yes → Checkbox/CheckboxGroup (multi-select)
└─ No → Use RadioButtonGroup for single selection
```

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured; `aria-label` if no visible label
- [ ] Keyboard navigation works as expected (Tab, Shift+Tab, Space)
- [ ] Visual states meet design system standards
- [ ] CheckboxGroup wraps Checkbox children, not standalone checkboxes in groups

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/checkbox
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/checkbox/Checkbox.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/checkbox/CheckboxGroup.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/checkbox/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/checkbox/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/checkbox/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--default
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--without-label
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--indeterminate
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--readonly
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--error
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--warning
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--with-description
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--horizontal-group
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--horizontal-group-with-descriptions
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--vertical-group-with-descriptions
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--wrap-group
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--no-wrap-group
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--uncontrolled-group
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--controlled-group
- https://storybook.saltdesignsystem.com/?path=/story/core-checkbox--long-text-group
## AI generation rules (required)

### Select this component when
Intent and interaction match this component's "When to use" guidance and the behavior can be expressed using documented props (checked/defaultChecked for single; checkedValues/defaultCheckedValues for group).

### Auto-configure

| Decision | Logic |
|---|---|
| **Import** | Use exact `import { Checkbox, CheckboxGroup } from "@salt-ds/core"` |
| **Component choice** | For grouped options, wrap Checkbox elements in CheckboxGroup; for independent options, use Checkbox alone |
| **State control** | Uncontrolled (defaultChecked or defaultCheckedValues) for one-time initialization; controlled (checked/checkedValues + onChange) for external state management |
| **Accessibility** | If no visible label, provide `aria-label` prop; if within FormField, ensure FormFieldLabel wraps CheckboxGroup; indeterminate prop rarely used except for parent checkboxes in hierarchical groups |

### Validation
Use these checks during generation while drafting output.

- [ ] Selection matches "When to use" (independent choice or grouped options, not mutually exclusive)
- [ ] "When not to use" anti-patterns are avoided (not RadioButton, not Switch for binary, not bare form labels)
- [ ] Controlled vs uncontrolled choice matches state management intent
- [ ] Accessibility requirements satisfied: aria-label if no label, role=checkbox applied automatically
- [ ] Keyboard interaction works: Tab (focus), Space (toggle), Shift+Tab (previous)