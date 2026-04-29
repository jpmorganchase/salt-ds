# Overlay (Copilot Context)

Use for floating contextual content (popovers, floating panels). Not for critical confirmations (use Dialog) or brief text hints (use Tooltip).

- API: ./overlay.json
- Guidance: ./overlay.md

## Key rules
- **Structure**: Always Overlay > { OverlayTrigger (Button), OverlayPanel > { OverlayHeader or OverlayPanelContent } }
- **Header (recommended)**: Use `OverlayHeader` with `header`, `description`, and `actions` props instead of deprecated `OverlayPanelCloseButton`
- **Placement**: Set `placement="top|bottom|left|right"` based on trigger position; floating-ui auto-repositions if overflow
- **Focus**: Automatically enters overlay on open, returns to trigger on close. Focus trapped within (Tab/Shift+Tab cycle)
- **Keyboard**: Escape closes from any content element; Tab/Shift+Tab cycle within panel; close button always accessible
- **Content**: Keep concise — constrained interaction only. Use Dialog for complex workflows or critical decisions
- **IDs**: Set id on Overlay, id-header on header, id-content on description for screen reader context
- **No nesting**: Do not nest Overlay inside Overlay. Use Dialog or Drawer for persistent/modal patterns
- **Click outside**: Closes overlay via floating-ui dismiss behavior (configurable if needed)

## Example (recommended pattern)

```tsx
import {
	Overlay,
	OverlayTrigger,
	OverlayPanel,
	OverlayPanelContent,
	OverlayHeader,
	Button,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { useState } from "react";

function FilterOverlay() {
	const [open, setOpen] = useState(false);

	return (
		<Overlay open={open} onOpenChange={setOpen} placement="bottom">
			<OverlayTrigger>
				<Button>Filter options</Button>
			</OverlayTrigger>
			<OverlayPanel>
				<OverlayHeader
					id="overlay-filter-header"
					header="Filter by category"
					description="Select one or more criteria"
					actions={
						<Button
							aria-label="Close"
							appearance="transparent"
							sentiment="neutral"
							onClick={() => setOpen(false)}
						>
							<CloseIcon aria-hidden />
						</Button>
					}
				/>
				<OverlayPanelContent id="overlay-filter-content">
					{/* Checkbox group, radio group, or filter controls */}
					<div>Category A</div>
					<div>Category B</div>
					<div>Category C</div>
				</OverlayPanelContent>
			</OverlayPanel>
		</Overlay>
	);
}
```
