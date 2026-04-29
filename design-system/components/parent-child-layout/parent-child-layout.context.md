# Parent-child layout (Copilot Context)

Two-region responsive layout where a parent (master) area controls a child (detail) area.

- API: ./parent-child-layout.json
- Guidance: ./parent-child-layout.md

## Key rules
- Always provide both required props: `parent` and `child`.
- Use `collapseAtBreakpoint` (default `sm`) to control when layout collapses.
- Use `visibleView` to pick which region is shown in collapsed mode.
- Keep the layout non-interactive; put controls inside parent/child content.
- Use semantic HTML and labeling within parent/child sections.
- Prefer this layout for master-detail interactions, not generic multi-item arrangements.

## Example
```tsx
import { ParentChildLayout } from "@salt-ds/core";

<ParentChildLayout
  collapseAtBreakpoint="md"
  visibleView="child"
  parent={<div>Navigation</div>}
  child={<div>Details</div>}
/>
```
