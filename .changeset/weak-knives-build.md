---
"@salt-ds/core": patch
---

Added `sentiment` and `appearance` to `ToggleButton` and `ToggleButtonGroup`.

```tsx
<ToggleButton sentiment="positive" appearance="bordered">
  Home
</ToggleButton>
```

```tsx
<ToggleButtonGroup sentiment="accented" appearance="bordered">
  <ToggleButton> Home</ToggleButton>
</ToggleButtonGroup>
```

Added support for disabled toggle button group showing selected value.
