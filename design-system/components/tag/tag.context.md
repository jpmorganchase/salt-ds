# Tag (Copilot Context)

Displays short, read-only metadata labels for categorization.

- API: ./tag.json
- Guidance: ./tag.md

## Key rules
- Use `Tag` for non-interactive categorization metadata
- Keep content concise (one or two words) and in sentence case
- Use `variant="primary"` by default; use `secondary` for stronger emphasis
- Use `category` values `1..20` for categorical color assignment
- Pair color with clear text or icon+text so meaning is not color-only
- Place tags close to the element they describe

## Example
```tsx
import { Tag } from "@salt-ds/core";

<Tag category={3} bordered>
	Urgent
</Tag>
```
