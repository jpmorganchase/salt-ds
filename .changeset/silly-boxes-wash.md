---
"@salt-ds/core": minor
---

Added Switch.

Switch is a binary control used to toggle between two different states. When interacted with, the thumb of the switch travels along the track to indicate state. Switch is used to control settings, preferences, or actions within an application or system.

```tsx
const [checked, setChecked] = useState(false);

const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  setChecked(event.target.checked);
  onChange?.(event);
};

return <Switch checked={checked} onChange={handleChange} />;
```
