# Combo Box (Copilot Context)

Filters and selects one or more options from large datasets with keyboard-first interaction.

- API: ./combo-box.json
- Guidance: ./combo-box.md

## Key rules
- Use exact import: `import { ComboBox, Option, OptionGroup } from "@salt-ds/core"`
- Use ComboBox for 10+ options where filtering is needed; choose Dropdown/Radio/Checkbox for small sets
- Use `multiselect` for multi-selection; otherwise keep default single-select mode
- Controlled mode uses `value`/`selected` with `onChange` and `onSelectionChange`; otherwise use defaults
- For non-string option values, provide `valueToString` so selected values display correctly

## Example

```tsx
import { ComboBox, Option, OptionGroup } from "@salt-ds/core";

<ComboBox placeholder="Select state">
	<OptionGroup label="US States">
		<Option value="California" />
		<Option value="New York" />
		<Option value="Texas" />
	</OptionGroup>
</ComboBox>
```
