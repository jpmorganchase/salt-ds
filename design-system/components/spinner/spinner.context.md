# Spinner (Copilot Context)

Indeterminate loading indicator for unknown-duration operations.

- API: ./spinner.json
- Guidance: ./spinner.md

## Key rules
- Import from `@salt-ds/core`.
- Prefer Spinner only for indeterminate loading; use Progress for determinate completion.
- Set meaningful contextual `aria-label` describing the loading target.
- Choose size by scope: `small` (embedded), `medium` (default/widget), `large` (page-level).
- Keep announcer defaults unless UX requires custom cadence/timeout.
- For long-running operations, pair with explicit status messaging; do not rely on spinner alone.

## Example
```tsx
import { Spinner } from "@salt-ds/core";

<Spinner
	role="status"
	aria-label="loading settings panel"
	size="medium"
/>
```
