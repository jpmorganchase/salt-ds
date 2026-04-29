# Interactable Card (Copilot Context)

Interactive card primitive for standalone actions and selectable card groups.

- API: ./interactable-card.json
- Guidance: ./interactable-card.md

## Key rules
- Use exact import: `import { InteractableCard, InteractableCardGroup } from "@salt-ds/core"`
- Use standalone `InteractableCard` for button-like card actions
- Use `InteractableCardGroup` for selectable card sets
- Use `multiSelect` only when multiple simultaneous selections are allowed
- In group usage, set stable `value` on each card
- Prefer `accent` over deprecated `accentPlacement`

## Example

```tsx
import { InteractableCard, InteractableCardGroup, StackLayout, Text } from "@salt-ds/core";

function ExampleInteractableCards() {
	return (
		<InteractableCardGroup>
			<InteractableCard value="card">
				<StackLayout gap={1}>
					<Text>Credit card</Text>
				</StackLayout>
			</InteractableCard>
			<InteractableCard value="wire">
				<StackLayout gap={1}>
					<Text>Bank wire</Text>
				</StackLayout>
			</InteractableCard>
		</InteractableCardGroup>
	);
}
```
