---
"@salt-ds/core": minor
---

Added `chrome` and `appearance` props for Button. These props replace the `variant` prop.

```tsx
    <Button chrome="accent" appearance="filled" />
    <Button chrome="accent" appearance="outlined" />
    <Button chrome="accent" appearance="minimal" />
    <Button chrome="neutral" appearance="filled" />
    <Button chrome="neutral" appearance="outlined" />
    <Button chrome="neutral" appearance="minimal" />
```

_Note:_ Button's `variant` prop is now deprecated and will be removed in the next major version.

| Deprecated                    | Replacement                                      |
| ----------------------------- | ------------------------------------------------ |
| `variant="cta"`               | `chrome="accent" appearance="filled"`            |
| `variant="primary"` (default) | `chrome="neutral" appearance="filled"` (default) |
| `variant="secondary"`         | `chrome="neutral" appearance="minimal"`          |
