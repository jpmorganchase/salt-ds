# Checkbox (Copilot Context)

Allows users to select or deselect independent options or groups of options. Use when users need to make multiple selections from a list, or a single independent choice.

- API: ./checkbox.json
- Guidance: ./checkbox.md

## Key rules
- Use Checkbox for independent boolean choices; use CheckboxGroup to wrap and manage multiple checkboxes together
- Controlled (checked/checkedValues + onChange) or uncontrolled (defaultChecked/defaultCheckedValues) — choose based on state management needs
- Always provide visible label via `label` prop or `aria-label` attribute
- Apply `indeterminate={true}` only for parent checkboxes with mixed child selection states
- Never omit the `value` prop when checkboxes are inside CheckboxGroup

## Example

```tsx
import { Checkbox, CheckboxGroup, FormField, FormFieldLabel } from "@salt-ds/core";

// Independent checkbox
<Checkbox label="I agree to terms" value="agree" />

// Grouped checkboxes (multi-select)
<CheckboxGroup name="interests" direction="vertical">
  <Checkbox label="Design" value="design" />
  <Checkbox label="Development" value="development" />
  <Checkbox label="Product" value="product" />
</CheckboxGroup>

// With FormField
<FormField>
  <FormFieldLabel>Preferences</FormFieldLabel>
  <CheckboxGroup defaultCheckedValues={["email"]}>
    <Checkbox label="Email notifications" value="email" />
    <Checkbox label="SMS notifications" value="sms" />
  </CheckboxGroup>
</FormField>
```
