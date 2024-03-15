---
"@salt-ds/core": minor
---

Added `Dropdown`, `Option`, `OptionGroup` and `ComboBox`.

```tsx
<Dropdown aria-label="Colors">
  <OptionGroup label="Primary">
    <Option value="Red" />
    <Option value="Blue" />
  </OptionGroup>
  <OptionGroup label="Other">
    <Option value="Pink" />
  </OptionGroup>
</Dropdown>
```

```tsx
<ComboBox aria-label="Colors">
  <OptionGroup label="Primary">
    <Option value="Red" />
    <Option value="Blue" />
  </OptionGroup>
  <OptionGroup label="Other">
    <Option value="Pink" />
  </OptionGroup>
</ComboBox>
```
