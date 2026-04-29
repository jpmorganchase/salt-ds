# Drawer (Copilot Context)

Shows modal supporting content from screen edges that users can dismiss when done.

- API: ./drawer.json
- Guidance: ./drawer.md

## Key rules
- Use exact import: `import { Drawer, DrawerCloseButton } from "@salt-ds/core"`
- Control visibility via `open` + `onOpenChange`
- Pick `position` by layout context: `left`/`right` for side context, `top`/`bottom` for horizontal content
- Use `disableDismiss` for mandatory-action flows and `disableScrim` only when non-obscured background is required
- Include a labeled close action (`DrawerCloseButton` or equivalent)

## Example

```tsx
import { useState } from "react";
import { Button, Drawer, DrawerCloseButton } from "@salt-ds/core";

function ExampleDrawer() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open Drawer</Button>
			<Drawer open={open} onOpenChange={setOpen} position="right" style={{ width: 320 }}>
				<DrawerCloseButton onClick={() => setOpen(false)} />
				Drawer content
			</Drawer>
		</>
	);
}
```
