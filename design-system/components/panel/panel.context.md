# Panel (Copilot Context)

Flat, non-interactive surface for structuring content regions and visual hierarchy.

- API: ./panel.json
- Guidance: ./panel.md

## Key rules
- Use `variant="primary"` for main content regions.
- Use `variant="secondary"` or `variant="tertiary"` for supporting regions.
- Keep Panel non-interactive; place interactive controls inside children.
- Prefer layout composition with `BorderLayout`, `GridLayout`, or `StackLayout`.
- Add region semantics only when Panel acts as a named landmark.
- Use Card-family components instead when the container itself needs interaction patterns.

## Example
```tsx
import { BorderLayout, Panel } from "@salt-ds/core";

<BorderLayout>
  <Panel variant="primary" data-region="center">
    Main content area
  </Panel>
  <Panel variant="secondary" data-region="east">
    Supporting content area
  </Panel>
</BorderLayout>
```
