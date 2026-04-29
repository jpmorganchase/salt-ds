# FormField (Copilot Context)

Field wrapper that provides shared label, helper text, and validation semantics for form controls.

- API: ./form-field.json
- Guidance: ./form-field.md

## Key rules
- Use exact import: `import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core"`
- Compose in order: `FormFieldLabel` → control(s) → optional `FormFieldHelperText`
- Set `disabled`, `readOnly`, `necessity`, and `validationStatus` at `FormField` level
- Use `labelPlacement` to match density/layout (`top`, `left`, `right`)
- Keep labels concise; move longer guidance into helper text

## Example

```tsx
import { FormField, FormFieldHelperText, FormFieldLabel, Input } from "@salt-ds/core";

function ExampleFormField() {
	return (
		<FormField validationStatus="error" necessity="required" labelPlacement="top">
			<FormFieldLabel>Email address</FormFieldLabel>
			<Input placeholder="name@example.com" bordered />
			<FormFieldHelperText>Please enter a valid email address.</FormFieldHelperText>
		</FormField>
	);
}
```````markdown
# FormField (Copilot Context)

Wraps form controls (Input, Dropdown, ComboBox, etc.) to provide accessible labels, helper text, and validation. **Every form control must be inside a FormField.**

- API: ./form-field.json
- Guidance: ./form-field.md

## Key rules
- Always include `FormFieldLabel` as the first child — every field needs an accessible label
- Set `validationStatus` on `FormField`, not on the wrapped control (e.g., Input) directly
- Use `FormFieldHelperText` for hints, instructions, or validation error messages
- Use `necessity` prop to indicate required/optional — don't manually add asterisks or "(required)" text
- If most fields in a form are mandatory, mark only the optional ones with `necessity="optional"` instead of marking every mandatory field
- The `necessity` prop handles both the visible indicator and `aria-required` for screen readers (WCAG 3.3.2)
- Never nest a FormField inside another FormField

## Example
```tsx
import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";

<FormField validationStatus="error" necessity="required">
  <FormFieldLabel>Email address</FormFieldLabel>
  <Input placeholder="name@example.com" bordered />
  <FormFieldHelperText>Please enter a valid email address</FormFieldHelperText>
</FormField>
```

````
