---
"@salt-ds/lab": minor
---

Switch `FormFieldNext` to use a compositional based API

```jsx
<FormFieldNext {...props}>
  <FormFieldLabel>My label</FormFieldLabel>
  <InputNext defaultValue="Value" />
  <FormFieldHelperText>Helper text</FormFieldHelperText>
</FormFieldNext>
```

Removed `helperText`, `label` props from `FormFieldNext`

Removed `FormFieldLabelProps`
Removed `FormFieldHelperTextProps`
