# Scrim (Copilot Context)

Backdrop overlay component used to dim background content and focus attention on foreground content.

- API: ./scrim.json
- Guidance: ./scrim.md

## Key rules
- Use `open` as the single visibility control; when false, Scrim should not render.
- Use `fixed` for viewport overlays; otherwise rely on a positioned parent container.
- For container-bound usage, ensure parent has explicit `position` styling.
- Use `children` for foreground cues such as loading spinner or close action.
- If using `onClick` for dismissal, pair with keyboard-accessible dismissal in associated overlay content.

## Example
```tsx
import { Scrim, Spinner } from "@salt-ds/core";

<Scrim open={loading} fixed>
	<Spinner size="medium" />
</Scrim>
```
