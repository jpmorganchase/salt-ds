````markdown
# Menu (Copilot Context)

Floating action menu for secondary or overflow commands.

- API: ./menu.json
- Guidance: ./menu.md

## Key rules
- Use exact import: `import { Menu, MenuItem, MenuTrigger, MenuPanel, MenuGroup } from "@salt-ds/core"`
- Compose in this order: `Menu` → `MenuTrigger` + `MenuPanel`
- Put actionable entries in `MenuItem`; use `MenuGroup` for related clusters
- Keep labels short, sentence case, and use ellipsis for actions needing further input
- Keep submenu depth low; nested menus should remain task-focused
- Do not use menu for form value input (use `Dropdown`/`ComboBox`)
- Preserve keyboard behavior for open, close, arrows, submenu navigation, and focus return

## Example

```tsx
import {
	Button,
	Menu,
	MenuGroup,
	MenuItem,
	MenuPanel,
	MenuTrigger,
} from "@salt-ds/core";

function ExampleMenu() {
	return (
		<Menu>
			<MenuTrigger>
				<Button appearance="transparent" aria-label="Open menu">
					Actions
				</Button>
			</MenuTrigger>
			<MenuPanel>
				<MenuGroup label="File">
					<MenuItem>Open...</MenuItem>
					<MenuItem>Export...</MenuItem>
				</MenuGroup>
				<MenuGroup>
					<MenuItem disabled>Delete</MenuItem>
				</MenuGroup>
			</MenuPanel>
		</Menu>
	);
}
```

````
