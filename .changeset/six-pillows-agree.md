---
"@salt-ds/lab": minor
---

Changes to Badge:

- Renamed `BadgeContent` to `value`
- Addition of inline styling when no child is passed to the component, enabling the badge to be used in other components e.g App Header
- Truncation of numerical values > 3 characters or when max value is exceeded
- Truncation of string values > 4 characters

With Child:

```
<Badge value={number} max={99}>
<SettingsIcon/>
<Badge/>
```

No Child - Inline:

```
<Badge value={string} />
```
