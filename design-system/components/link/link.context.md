# Link (Copilot Context)

Navigation primitive for destination-based interactions.

- API: ./link.json
- Guidance: ./link.md

## Key rules
- Use exact import: `import { Link } from "@salt-ds/core"`
- Use `Link` for navigation destinations, not UI actions
- Keep link text concise, meaningful, and understandable out of context
- Use `target="_blank"` only when necessary; pair with secure `rel` values for cross-origin targets
- For icon-only links, provide `aria-label`
- For icon + text links, mark decorative icons as `aria-hidden`

## Example

```tsx
import { Link } from "@salt-ds/core";

function ExampleLink() {
	return (
		<Link href="https://www.example.com/help" target="_blank" rel="noopener">
			Visit help center
		</Link>
	);
}
```
