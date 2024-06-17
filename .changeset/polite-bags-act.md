---
"@salt-ds/lab": minor
---

Changed `StepperInput`'s `onChange` to return an event and value.

```tsx
<StepperInput
  value={value}
  onChange={(_event, value) => {
    setValue(value);
  }}
/>
```
