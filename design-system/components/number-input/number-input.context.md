````markdown
# Number Input (Copilot Context)

Numeric entry field with stepper controls and committed numeric callbacks.

- API: ./number-input.json
- Guidance: ./number-input.md

## Key rules
- Use exact import: `import { NumberInput } from "@salt-ds/core"`
- Use `onChange` for string editing state; use `onNumberChange` for committed parsed number updates
- Use either controlled (`value`) or uncontrolled (`defaultValue`) mode consistently
- Add `min`/`max` for range constraints; use `clamp` only when commit-time enforcement is required
- Pair custom `format` with compatible `parse` (and usually `pattern`)
- Prefer `FormField` composition for label/help/validation semantics
- If clamp or reset/sync controls change values unexpectedly, announce updates for assistive tech users

## Example

```tsx
import {
	FormField,
	FormFieldHelperText,
	FormFieldLabel,
	NumberInput,
} from "@salt-ds/core";
import { useState } from "react";

function ExampleNumberInput() {
	const [value, setValue] = useState("2");
	const min = 0;
	const max = 5;

	return (
		<FormField>
			<FormFieldLabel>Quantity</FormFieldLabel>
			<NumberInput
				value={value}
				onChange={(_event, next) => setValue(next)}
				onNumberChange={(_event, parsed) => {
					// handle committed numeric value
					console.log(parsed);
				}}
				min={min}
				max={max}
				clamp
				step={1}
				stepMultiplier={2}
			/>
			<FormFieldHelperText>
				Enter a value between {min} and {max}
			</FormFieldHelperText>
		</FormField>
	);
}
```

````
