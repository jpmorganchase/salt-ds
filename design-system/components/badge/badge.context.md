# Badge (Copilot Context)

Use for compact, non-interactive annotations (count, short text, or dot) attached to related content.

- API: ./badge.json
- Guidance: ./badge.md

## Key rules
- Import from `@salt-ds/core`.
- Omit `value` for dot badge; use numeric or short string `value` otherwise.
- Use `max` only with numeric values (default overflow behavior is `999+`).
- If badge is attached to a focusable child, ensure accessible naming includes badge meaning.
- Exclude QA stories during Storybook validation.

## Example
```tsx
import { Badge } from "@salt-ds/core";

<Badge value={9} />
```
