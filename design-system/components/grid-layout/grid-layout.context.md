# Grid Layout (Copilot Context)

Two-dimensional responsive layout container using CSS grid rows and columns.

- API: ./grid-layout.json
- Guidance: ./grid-layout.md

## Key rules
- Use exact import: `import { GridLayout, GridItem } from "@salt-ds/core"`
- Prefer `GridItem` children when item-level span/alignment behavior is needed
- Start with defaults (`columns=12`, `rows=1`, `gap=3`) unless requirements specify otherwise
- Use `columnGap` and `rowGap` when spacing differs by axis
- Use responsive props when layout changes across breakpoints
- Use `as` for semantic layout landmarks/regions

## Example

```tsx
import { GridItem, GridLayout } from "@salt-ds/core";

function ExampleGridLayout() {
	return (
		<GridLayout columns={{ xs: 1, md: 4 }} rows={2} gap={3}>
			<GridItem colSpan={{ md: 2 }}>Primary</GridItem>
			<GridItem>Secondary</GridItem>
			<GridItem>Details</GridItem>
		</GridLayout>
	);
}
```
