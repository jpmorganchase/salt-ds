# Pill (Copilot Context)

Compact interactive token component for quick actions, filters, and multi-select groups.

- API: ./pill.json
- Guidance: ./pill.md

## Key rules
- Use `Pill` for short labels only; do not generate sentence-length content.
- For selectable behavior, use `PillGroup selectionVariant="multiple"` and set a unique `value` on each `Pill`.
- Use `selected` + `onSelectionChange` for controlled selection, or `defaultSelected` for uncontrolled setup.
- Ensure grouped pills have an accessible name via visible label or `aria-label` / `aria-labelledby`.
- Prefer `PillGroup disabled` when all pills must be disabled together.

## Example
```tsx
import { Pill, PillGroup } from "@salt-ds/core";

<PillGroup selectionVariant="multiple" aria-label="Select skills">
	<Pill value="html">HTML/CSS</Pill>
	<Pill value="react">React</Pill>
</PillGroup>
```
