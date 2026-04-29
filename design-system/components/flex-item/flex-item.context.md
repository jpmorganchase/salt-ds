# Flex Item (Copilot Context)

Per-item sizing and alignment control for flex-based layout containers.

- API: ./flex-item.json
- Guidance: ./flex-item.md

## Key rules
- Use exact import: `import { FlexItem } from "@salt-ds/core"`
- Use `FlexItem` only inside flex-based parent layouts (`FlexLayout`, `FlowLayout`, `StackLayout`, `SplitLayout`)
- Prefer parent layout props first; add item-level overrides (`grow`, `shrink`, `basis`, `align`) only when needed
- Use responsive values for size/alignment behavior that must change across breakpoints
- Use `as` when semantic HTML structure is required

## Example

```tsx
import { FlexItem, FlexLayout } from "@salt-ds/core";

function ExampleFlexItem() {
	return (
		<FlexLayout>
			<FlexItem grow={1}>Primary</FlexItem>
			<FlexItem basis="240px" shrink={0} align="start">
				Secondary
			</FlexItem>
		</FlexLayout>
	);
}
```
