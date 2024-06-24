---
"@salt-ds/lab": minor
---

Changed `StepperInput`'s `onChange` to return a value and an optional event.

```tsx
<StepperInput
  value={value}
  onChange={(value, event) => {
    setValue(value);
  }
/>
```
