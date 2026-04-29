# Flow Layout (Copilot Context)

Simple wrapping row layout for responsive small-scale sections.

- API: ./flow-layout.json
- Guidance: ./flow-layout.md

## Key rules
- Use exact import: `import { FlowLayout, FlexItem } from "@salt-ds/core"`
- `FlowLayout` always models a wrapping row; use `FlexLayout` for more complex direction control
- Use container props (`align`, `justify`, `gap`, `margin`, `padding`) for layout-level behavior
- Use `FlexItem` only for per-item alignment/size overrides
- Use `as` for semantic container elements when structure matters

## Example

```tsx
import { FlexItem, FlowLayout } from "@salt-ds/core";

function ExampleFlowLayout() {
	return (
		<FlowLayout gap={3} justify="space-between" as="nav">
			<FlexItem>Filter A</FlexItem>
			<FlexItem>Filter B</FlexItem>
			<FlexItem grow={1}>Search</FlexItem>
		</FlowLayout>
	);
}
```
