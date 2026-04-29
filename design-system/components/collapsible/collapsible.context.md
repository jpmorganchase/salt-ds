# Collapsible (Copilot Context)

Shows or hides a single section of content using a trigger and panel disclosure pattern.

- API: ./collapsible.json
- Guidance: ./collapsible.md

## Key rules
- Use exact import: `import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@salt-ds/core"`
- Use `defaultOpen` for uncontrolled behavior; use `open` + `onOpenChange` for controlled behavior
- Always wrap the interactive trigger element in `CollapsibleTrigger`
- Place collapsible content inside `CollapsiblePanel` so hidden/aria-hidden behavior is applied
- Prefer a Button as trigger child for keyboard and accessibility consistency

## Example

```tsx
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@salt-ds/core";

<Collapsible defaultOpen={false}>
	<CollapsibleTrigger>
		<Button>Show details</Button>
	</CollapsibleTrigger>
	<CollapsiblePanel>
		<p>Disclosure content goes here.</p>
	</CollapsiblePanel>
</Collapsible>
```
