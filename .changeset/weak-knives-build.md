---
"@salt-ds/core": minor
---

Added `sentiment`, `appearance` and `readOnly` props to `ToggleButton` and `ToggleButtonGroup`.

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

```tsx
<ToggleButtonGroup readOnly={true}>
  <ToggleButton> Home</ToggleButton>
</ToggleButtonGroup>
```

Added support for visually indicating the selected toggle button within a disabled toggle button group.
