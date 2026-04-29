````markdown
# NavigationItem (Copilot Context)

Navigation item for horizontal/vertical page navigation and optional nested hierarchy.

- API: ./navigation-item.json
- Guidance: ./navigation-item.md

## Key rules
- Use exact import: `import { NavigationItem } from "@salt-ds/core"`
- Use `href` for destination links (link semantics)
- For parent toggles that reveal child items, use `parent` + `expanded` + `onExpand` and do not require `href`
- Set `active` only on the current route item
- Use `blurActive` on collapsed parents that contain an active descendant
- Wrap sets in a `nav` landmark with a clear label
- Use sentence case labels; keep horizontal labels concise and consider tooltip for truncation

## Example

```tsx
import { NavigationItem, StackLayout } from "@salt-ds/core";
import { useState } from "react";

function ExampleNavigation() {
	const [expanded, setExpanded] = useState(true);
	const [active, setActive] = useState("overview");

	return (
		<nav aria-label="Main navigation">
			<StackLayout as="ul" gap="var(--salt-spacing-fixed-100)">
				<li>
					<NavigationItem
						orientation="vertical"
						parent
						expanded={expanded}
						onExpand={() => setExpanded(!expanded)}
						blurActive={!expanded && active !== "overview"}
					>
						Products
					</NavigationItem>
				</li>
				{expanded && (
					<li>
						<NavigationItem
							orientation="vertical"
							level={1}
							href="/products/overview"
							active={active === "overview"}
						>
							Overview
						</NavigationItem>
					</li>
				)}
			</StackLayout>
		</nav>
	);
}
```

````
