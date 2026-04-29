# Border Item (Copilot Context)

Use `BorderItem` to place content into a named `BorderLayout` region with optional sticky behavior and responsive spacing.

- API: ./border-item.json
- Guidance: ./border-item.md

## Key rules
- Use `import { BorderItem } from "@salt-ds/core";`.
- Always provide `position` with one of: `north`, `west`, `center`, `east`, `south`.
- Use `sticky` only when a region must remain visible while surrounding regions scroll.
- Exclude QA stories when validating Storybook examples.

## Example
```tsx
import { BorderItem } from "@salt-ds/core";

<BorderItem position="west" sticky>
	Navigation
</BorderItem>
```
