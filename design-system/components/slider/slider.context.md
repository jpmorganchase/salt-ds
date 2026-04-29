# Slider (Copilot Context)

Single-value numeric range control with pointer and keyboard interaction.

- API: ./slider.json
- Guidance: ./slider.md

## Key rules
- Import from `@salt-ds/core`.
- Always define meaningful `min` and `max`; add `step` for precision requirements.
- Use `marks` for predefined points; add `restrictToMarks` only when selection must snap to marks.
- Use `showTicks` only alongside marks.
- Provide accessible naming (`aria-label` or label association) and value semantics (`format`/`aria-valuetext`) where needed.
- Choose one state pattern: controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
- Prefer `Input` instead when exact large-range numeric entry is primary.

## Example
```tsx
import { Slider } from "@salt-ds/core";

<Slider
	aria-label="Volume"
	min={0}
	max={100}
	defaultValue={30}
	marks={[{ value: 0, label: "0" }, { value: 50, label: "50" }, { value: 100, label: "100" }]}
	showTicks
/>
```
