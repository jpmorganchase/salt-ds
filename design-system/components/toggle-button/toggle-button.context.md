# Toggle Button (Copilot Context)

Single-select control for high-affordance choices, either standalone or inside `ToggleButtonGroup`.

- API: ./toggle-button.json
- Guidance: ./toggle-button.md

## Key rules
- Use `ToggleButtonGroup` for mutually exclusive options with two or more choices
- Use `Switch` for binary on/off and `RadioButtonGroup` for lower-priority form choices
- Keep labels short (prefer 1–3 words); avoid ampersands as a space-saving tactic
- For text+icon buttons, mark icon `aria-hidden`; for icon-only, set button `aria-label`
- Use `readOnly` when selection should remain perceivable but non-editable; use `disabled` when unavailable

## Example
```tsx
import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";

<ToggleButtonGroup defaultValue="left" aria-label="Text alignment">
	<ToggleButton value="left">Left</ToggleButton>
	<ToggleButton value="center">Center</ToggleButton>
	<ToggleButton value="right">Right</ToggleButton>
</ToggleButtonGroup>
```
