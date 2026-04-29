# Radio Button (Copilot Context)

Use for mutually exclusive single-choice selection from a visible option set.

- API: ./radio-button.json
- Guidance: ./radio-button.md

## Key rules
- Always group related radio options inside `RadioButtonGroup`.
- Prefer `value` + `onChange` for controlled forms; use `defaultValue` for simple uncontrolled scenarios.
- Use `direction="vertical"` by default; switch to horizontal only when labels remain readable.
- Set `validationStatus` at group level so nested radios stay consistent.
- Provide accessible group naming via visible label or `aria-label` / `aria-labelledby`.
- Avoid using standalone `readOnly` radios; prefer group-level `readOnly`.

## Example
```tsx
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

<RadioButtonGroup name="region" defaultValue="apac">
	<RadioButton label="NAMR" value="namr" />
	<RadioButton label="APAC" value="apac" />
	<RadioButton label="EMEA" value="emea" />
</RadioButtonGroup>
```
