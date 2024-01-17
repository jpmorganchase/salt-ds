---
"@salt-ds/lab": minor
---

Refactor Combo Box Next and Dropdown Next to use compositional APIs.

## Dropdown Next

```tsx
<DropdownNext>
  {colors.map((color) => (
    <Option value={color} key={color}>
      {color}
    </Option>
  ))}
</DropdownNext>
```

## Combo Box Next

```tsx
<ComboBoxNext>
  {colors.map((color) => (
    <Option value={color} key={color}>
      {color}
    </Option>
  ))}
</ComboBoxNext>
```
