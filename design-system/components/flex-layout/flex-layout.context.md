# Flex Layout (Copilot Context)

One-dimensional layout container with responsive direction, wrapping, and spacing.

- API: ./flex-layout.json
- Guidance: ./flex-layout.md

## Key rules
- Use exact import: `import { FlexLayout, FlexItem } from "@salt-ds/core"`
- Use `FlexLayout` for container-level layout control and `FlexItem` for per-item overrides
- Default to `direction="row"`; apply responsive direction/wrap only when viewport behavior requires it
- Use `gap`, `margin`, and `padding` with Salt spacing multipliers for consistent rhythm
- Prefer semantic HTML via `as` when structure matters (for example list semantics)
- Treat `separators` as legacy/deprecated behavior; prefer layout patterns that don't rely on it when possible

## Example

```tsx
import { FlexItem, FlexLayout } from "@salt-ds/core";

function ExampleFlexLayout() {
	return (
		<FlexLayout direction={{ xs: "column", md: "row" }} wrap={{ xs: false, md: true }} gap={3}>
			<FlexItem grow={1}>Primary content</FlexItem>
			<FlexItem basis="280px" shrink={0}>Secondary content</FlexItem>
		</FlexLayout>
	);
}
```
