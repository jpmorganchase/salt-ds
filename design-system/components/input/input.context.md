# Input (Copilot Context)

Single-line text entry component with optional adornments and validation styling.

- API: ./input.json
- Guidance: ./input.md

## Key rules
- Use exact import: `import { Input } from "@salt-ds/core"`
- Use `Input` for single-line entry; use `MultilineInput` for multi-line content
- Prefer wrapping with `FormField` when labels, helper text, or validation messaging are needed
- Use either controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) mode consistently
- Do not use placeholder as the only instruction
- Do not use adornments as the only label

## Example

```tsx
import { FormField, FormFieldHelperText, FormFieldLabel, Input } from "@salt-ds/core";

function ExampleInput() {
	return (
		<FormField>
			<FormFieldLabel>Email</FormFieldLabel>
			<Input placeholder="name@example.com" bordered />
			<FormFieldHelperText>Use your work email address</FormFieldHelperText>
		</FormField>
	);
}
```
