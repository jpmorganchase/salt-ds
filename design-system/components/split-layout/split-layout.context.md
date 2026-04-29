# Split layout (Copilot Context)

Two-region layout that positions start and end content at opposite ends of a container.

- API: ./split-layout.json
- Guidance: ./split-layout.md

## Key rules
- Use for exactly two peer regions (`startItem`, `endItem`) in one container.
- Default direction is `row`; switch to `column` only when layout intent requires it.
- Use responsive direction values for breakpoint-specific orientation changes.
- Keep spacing minimal by default (`margin`/`padding` zero) unless explicit requirements exist.
- Use semantic HTML with the `as` prop for meaningful structures.
- Prefer `FlowLayout` or `FlexLayout` when you need more than two items.

## Example
```tsx
import { SplitLayout } from "@salt-ds/core";

<SplitLayout
  direction={{ xs: "column", sm: "row" }}
  startItem={<div>Left controls</div>}
  endItem={<div>Right actions</div>}
/>
```
