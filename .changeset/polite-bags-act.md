---
"@salt-ds/lab": minor
---

## StepperInput updates

- Added `bordered` prop for a full border style
- `StepperInputProps` extends `div` props instead of `Input`, so align with other similar components
- Changed `onChange` to an optional event (when triggered by an synthetic event) and value.
- Added more keyboard interactions, e.g. Shift + Up / Down, Home, End.
- `stepBlock` replaceds `block` prop, which now explicitly defines the value that is increment or decrement, not a multiplier of `step`.

```tsx
<StepperInput
  stepBlock={100}
  value={value}
  onChange={(_event, value) => {
    setValue(value);
  }
/>
```
