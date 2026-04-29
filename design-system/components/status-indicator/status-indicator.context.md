# StatusIndicator (Copilot Context)

Displays a semantic status icon for `info`, `success`, `warning`, or `error`.

- API: ./status-indicator.json
- Guidance: ./status-indicator.md

## Key rules
- `status` is required and must be one of: `info`, `success`, `warning`, `error`
- Prefer higher-level Salt components (`Banner`, `Toast`, `Tooltip`) when they already represent status
- For meaningful standalone usage, keep an accessible name (`aria-label` defaults from `status`)
- For decorative usage beside equivalent text, set `aria-hidden="true"`
- Do not override icon color; rely on Salt semantic tokens

## Example
```tsx
import { StatusIndicator } from "@salt-ds/core";

{/* With visible text */}
<FlowLayout gap={1} align="center">
  <StatusIndicator status="success" />
  <Text>Payment received</Text>
</FlowLayout>

{/* Decorative alongside equivalent text */}
<StatusIndicator status="warning" aria-hidden="true" />
```
