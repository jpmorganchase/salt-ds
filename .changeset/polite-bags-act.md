---
"@salt-ds/lab": minor
---

## StepperInput updates

- Added `bordered` prop for a full border style
- Changed `StepperInputProps` to extend `div` props instead of `Input`, to align with other input components
- Added an optional event to `onChange`, when triggered by synthetic event
- Added more keyboard interactions, e.g. Shift + Up / Down, Home, End.
- Replaced `block` with `stepBlock` prop, which now explicitly defines the value that is increment or decrement, not a multiplier of `step`.

```tsx
<StepperInput
  stepBlock={100}
  value={value}
  onChange={(_event, value) => {
    setValue(value);
  }
/>
```
