# Grid Item (Copilot Context)

Per-item placement and alignment wrapper for CSS grid layouts.

- API: ./grid-item.json
- Guidance: ./grid-item.md

## Key rules
- Use exact import: `import { GridItem, GridLayout } from "@salt-ds/core"`
- Use `GridItem` inside `GridLayout`
- Keep defaults unless intent requires overrides (`colSpan`, `rowSpan`, alignment)
- Use responsive values when span/alignment should change across breakpoints
- Use `as` when semantic HTML is required

## Example

```tsx
import { GridItem, GridLayout } from "@salt-ds/core";

function ExampleGridItem() {
	return (
		<GridLayout columns={4} rows={2}>
			<GridItem colSpan={2} rowSpan={2}>
				Primary
			</GridItem>
			<GridItem horizontalAlignment="center" verticalAlignment="start">
				Secondary
			</GridItem>
		</GridLayout>
	);
}
```
