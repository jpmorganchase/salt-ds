# Status Adornment (Copilot Context)

Compact validation icon adornment for form controls.

- API: ./status-adornment.json
- Guidance: ./status-adornment.md

## Key rules
- Import from `@salt-ds/core`.
- Provide required `status`; use validation-oriented values (`error`, `warning`, `success`).
- Use inside field/adornment contexts (for example Input/PillInput validation affordances).
- Do not use as the sole status communication; pair with textual validation messaging.
- Unsupported status mappings can render no icon, so avoid non-adornment statuses.

## Example
```tsx
import { StatusAdornment } from "@salt-ds/core";

<StatusAdornment status="error" aria-label="error" />
```
