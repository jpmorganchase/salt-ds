---
"@salt-ds/core": minor
---

Added `color` and `appearance` props for Button. These props replace the `variant` prop.

```tsx
    <Button color="accent" appearance="solid" />
    <Button color="accent" appearance="bordered" />
    <Button color="accent" appearance="transparent" />
    <Button color="neutral" appearance="solid" />
    <Button color="neutral" appearance="bordered" />
    <Button color="neutral" appearance="transparent" />
```

_Note:_ Button's `variant` prop is now deprecated and will be removed in the next major version.

| Deprecated                    | Replacement                                    |
| ----------------------------- | ---------------------------------------------- |
| `variant="cta"`               | `color="accent" appearance="solid"`            |
| `variant="primary"` (default) | `color="neutral" appearance="solid"` (default) |
| `variant="secondary"`         | `color="neutral" appearance="transparent"`     |
