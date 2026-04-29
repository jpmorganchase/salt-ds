````markdown
# Multiline Input (Copilot Context)

Textarea-style field for freeform multi-line text entry.

- API: ./multiline-input.json
- Guidance: ./multiline-input.md

## Key rules
- Use exact import: `import { MultilineInput } from "@salt-ds/core"`
- Prefer `MultilineInput` only when input may exceed one line; otherwise use `Input`
- Keep default `rows={3}` unless expected content length justifies adjustment
- Use either controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) mode consistently
- Prefer `FormField` composition for label/help/validation messaging
- Do not rely on placeholder as primary instructions
- Ensure interactive adornments are disabled when multiline input is disabled or read-only

## Example

```tsx
import {
	Button,
	FormField,
	FormFieldHelperText,
	FormFieldLabel,
	MultilineInput,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { useState } from "react";

function ExampleMultilineInput() {
	const [value, setValue] = useState("Notes");
	const overLimit = value.length > 120;

	return (
		<FormField>
			<FormFieldLabel>Comments</FormFieldLabel>
			<MultilineInput
				rows={4}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				validationStatus={overLimit ? "error" : undefined}
				endAdornment={
					<Button
						appearance="transparent"
						aria-label="Clear comment"
						onClick={() => setValue("")}
					>
						<CloseIcon aria-hidden />
					</Button>
				}
			/>
			<FormFieldHelperText>Provide context for your update.</FormFieldHelperText>
		</FormField>
	);
}
```

````
