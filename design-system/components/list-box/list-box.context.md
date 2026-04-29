````markdown
# List Box (Copilot Context)

Visible listbox for single- or multi-select option picking.

- API: ./list-box.json
- Guidance: ./list-box.md

## Key rules
- Use exact import: `import { ListBox, Option, OptionGroup } from "@salt-ds/core"`
- Default to single-select; use `multiselect` only for explicit multi-selection needs
- Provide an accessible name on `ListBox` (`aria-label` or `aria-labelledby`)
- Give every `Option` a stable `value`
- Use `OptionGroup label` for grouped options
- Use either controlled (`selected` + `onSelectionChange`) or uncontrolled (`defaultSelected`) selection consistently
- Keep option content readable; if adding supporting visuals, keep them secondary to the option label

## Example

```tsx
import { ListBox, Option, OptionGroup } from "@salt-ds/core";

function ExampleListBox() {
	return (
		<ListBox aria-label="State" multiselect style={{ width: "12rem" }}>
			<OptionGroup label="A">
				<Option value="Alabama" />
				<Option value="Alaska" />
			</OptionGroup>
			<OptionGroup label="B">
				<Option value="Boston">Boston</Option>
			</OptionGroup>
		</ListBox>
	);
}
```

````
