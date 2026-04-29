# Segmented Button Group (Copilot Context)

Use to present a compact, related set of actionable buttons as one segmented cluster.

- API: ./segmented-button-group.json
- Guidance: ./segmented-button-group.md

## Key rules
- Group only related actions in one `SegmentedButtonGroup`.
- Keep button variants consistent within a single group.
- Use icon-only buttons only with clear `aria-label` values and supporting tooltips.
- For split-button behavior, combine one action button with a menu-trigger button in the same group.
- Preserve straightforward tab order through grouped actions.

## Example
```tsx
import { Button, SegmentedButtonGroup, Tooltip } from "@salt-ds/core";
import { MessageIcon } from "@salt-ds/icons";

<SegmentedButtonGroup>
	<Tooltip content="Message">
		<Button aria-label="Message">
			<MessageIcon aria-hidden />
		</Button>
	</Tooltip>
</SegmentedButtonGroup>
```
