# Link Card (Copilot Context)

Card-styled anchor used as a full-surface navigation entry point.

- API: ./link-card.json
- Guidance: ./link-card.md

## Key rules
- Use exact import: `import { LinkCard } from "@salt-ds/core"`
- Use for navigation destinations, not action triggers
- Always provide a clear `href`
- Avoid nested interactive controls inside the card
- Keep heading/body content descriptive of destination
- Use `target="_blank"` only when needed and pair with secure `rel` for cross-origin links

## Example

```tsx
import { H3, LinkCard, StackLayout, Text } from "@salt-ds/core";

function ExampleLinkCard() {
	return (
		<LinkCard href="/reports" accent="top" style={{ width: "260px" }}>
			<StackLayout gap={1}>
				<H3>Quarterly reports</H3>
				<Text>Open performance and commentary for the latest quarter.</Text>
			</StackLayout>
		</LinkCard>
	);
}
```
