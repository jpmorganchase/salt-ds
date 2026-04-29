# Stack Layout (Copilot Context)

One-dimensional, non-wrapping layout for ordered vertical or horizontal stacking.

- API: ./stack-layout.json
- Guidance: ./stack-layout.md

## Key rules
- Import from `@salt-ds/core`.
- Use StackLayout when content should not wrap; switch to `FlowLayout` if wrapping is needed.
- Default to `direction="column"`; use responsive `direction` for breakpoint changes.
- Use `separators` to add visual division between stacked items.
- Use `as` to render semantic containers (for example `ul`) with semantic children.
- Keep spacing simple (`gap` default is 3; `margin` and `padding` default to 0).

## Example
```tsx
import { StackLayout } from "@salt-ds/core";

<StackLayout as="ul" direction={{ xs: "column", md: "row" }} separators>
	<li>Overview</li>
	<li>Activity</li>
	<li>Settings</li>
</StackLayout>
```
