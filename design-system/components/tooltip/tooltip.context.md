# Tooltip (Copilot Context)

Shows contextual, supplementary information on hover/focus for interactive elements.

- API: ./tooltip.json
- Guidance: ./tooltip.md

## Key rules

- Use only for short, non-essential guidance tied to an interactive trigger.
- Do not place interactive controls inside tooltip content.
- Keep content concise and plain; rich formatting may not be conveyed through `aria-describedby`.
- Default behavior: `placement="right"`, `enterDelay={300}`, `leaveDelay={0}`.
- Use `status` only for semantic emphasis (`info`, `warning`, `error`, `success`).
- Trigger remains focusable; tooltip itself must not receive focus.
- `Escape` dismisses visible tooltip.
- If guidance is required, persistent, or interactive, use inline content/Overlay/Dialog/Banner.

## Example
```tsx
import { Tooltip } from "@salt-ds/core";

<Tooltip content="Save your current changes" status="info" placement="right">
  <Button appearance="solid" sentiment="accented">Save</Button>
</Tooltip>
```
