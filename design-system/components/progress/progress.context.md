# Progress (Copilot Context)

Use progress indicators for measurable completion state with circular or linear variants.

- API: ./progress.json
- Guidance: ./progress.md

## Key rules
- Use `LinearProgress` for inline bars/status rows; use `CircularProgress` for compact radial contexts.
- For determinate progress, set `value` (and optional `min`/`max`); keep values within range.
- For linear indeterminate mode, omit both `value` and `bufferValue`.
- Use `bufferValue` only when pending progress should be visualized separately.
- Always provide a contextual `aria-label` describing what is loading.
- If duration is truly unknown and you only need a loading affordance, prefer `Spinner`.

## Example
```tsx
import { LinearProgress } from "@salt-ds/core";

<LinearProgress aria-label="Uploading report" value={38} bufferValue={60} />
```
