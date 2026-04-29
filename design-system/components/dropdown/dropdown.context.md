# Dropdown (Copilot Context)

Select-only control for choosing one or more values from a bounded option list.

- API: ./dropdown.json
- Guidance: ./dropdown.md

## Key rules
- Use exact import: `import { Dropdown, Option, OptionGroup } from "@salt-ds/core"`
- Use `Option` children for list content; add `OptionGroup` only when grouped labeling is required
- Use single-select by default and enable `multiselect` only for explicit multi-select requirements
- Prefer uncontrolled usage (`defaultSelected`, `defaultOpen`); use controlled props when parent state orchestration is needed
- Provide `valueToString` when option values are objects or not equal to rendered text
- Keep labeling explicit (typically via `FormFieldLabel`) and preserve keyboard interactions

## Example

```tsx
import { FormField, FormFieldLabel, Dropdown, Option } from "@salt-ds/core";

function ExampleDropdown() {
	return (
		<FormField>
			<FormFieldLabel>State</FormFieldLabel>
			<Dropdown defaultSelected={["California"]} placeholder="Select a state">
				<Option value="Alaska" />
				<Option value="California" />
				<Option value="New York" />
			</Dropdown>
		</FormField>
	);
}
```
