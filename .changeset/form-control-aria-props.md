---
"@salt-ds/core": patch
---

Fixed `aria-label`, `aria-labelledby` and `aria-describedby` being applied to the root element of `Input`, `MultilineInput`, `NumberInput`, `ComboBox`, `Checkbox`, `RadioButton` and `Switch` instead of their `input` or `textarea` element. You no longer need to pass these props through `inputProps` or `textAreaProps`.

```tsx
<Input aria-label="Search" />
<Checkbox aria-labelledby="row-1-name" aria-describedby="row-1-status" />
```

- If `aria-label` is set both on the component and in `inputProps` or `textAreaProps`, the one in `inputProps` or `textAreaProps` takes precedence.
- `aria-labelledby` and `aria-describedby` are merged with the IDs from `FormField` and from `inputProps` or `textAreaProps`, in that order.
