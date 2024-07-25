---
"@salt-ds/core": minor
---

Added `color` and `appearance` props for Button. These props replace the `variant` prop.

```tsx
    <Button color="accent" appearance="solid" />
    <Button color="accent" appearance="outline" />
    <Button color="accent" appearance="transparent" />
    <Button color="neutral" appearance="solid" />
    <Button color="neutral" appearance="outline" />
    <Button color="neutral" appearance="transparent" />
```

_Note:_ Button's `variant` prop is now deprecated and will be removed in the next major version.
