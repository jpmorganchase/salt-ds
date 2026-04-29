# Switch (Copilot Context)

Toggles a binary setting on or off with immediate effect.

- API: ./switch.json
- Guidance: ./switch.md

## Key rules
- Use `Switch` for immediate on/off changes, not for multi-select or navigation choices
- Prefer visible `label` text describing the resulting behavior
- Use `defaultChecked` for uncontrolled usage; use `checked` + `onChange` for controlled usage
- Use `disabled` when users must not focus or change it
- Use `readOnly` only when users should still focus/read the associated description
- Ensure keyboard support expectations (`Tab`, `Shift+Tab`, `Space`) are preserved

## Example
```tsx
import { Switch } from "@salt-ds/core";

<Switch label="Enable notifications" defaultChecked />
```
