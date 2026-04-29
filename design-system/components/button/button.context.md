# Button (Copilot Context)

Use for triggering actions. Not for navigation (use Link).

- API: ./button.json
- Guidance: ./button.md

## Key rules
- Use when a user needs to execute an action in place.
- Do not use for navigation; use `Link`.
- Default to `sentiment="neutral"` and `appearance="solid"`.
- For destructive actions, use `sentiment="negative"`.
- For icon-only buttons, provide `aria-label`.
- If `loading` is true, provide `loadingAnnouncement`.

## Example
```tsx
import { Button } from "@salt-ds/core";

<Button sentiment="neutral" appearance="solid">Save</Button>
```
