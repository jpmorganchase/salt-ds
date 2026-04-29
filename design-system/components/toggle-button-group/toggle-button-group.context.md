# Toggle Button Group (Copilot Context)

Single-select grouped toggle control with radiogroup semantics and shared styling for related options.

- API: ./toggle-button-group.json
- Guidance: ./toggle-button-group.md

## Key rules
- Import and compose `ToggleButtonGroup` with child `ToggleButton` options
- Use at least two related options and keep labels concise
- Use `value`/`onChange` for controlled patterns; `defaultValue` for uncontrolled patterns
- Use `readOnly` when selected value should remain perceivable but not editable; use `disabled` when unavailable
- In icon-only groups, give each button an `aria-label` and set icon `aria-hidden`

## Example
```tsx
import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";

<ToggleButtonGroup aria-label="Trade action" defaultValue="hold">
	<ToggleButton value="buy">Buy</ToggleButton>
	<ToggleButton value="sell">Sell</ToggleButton>
	<ToggleButton value="hold">Hold</ToggleButton>
</ToggleButtonGroup>
```
