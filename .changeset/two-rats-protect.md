---
"@salt-ds/theme": minor
---

Added theme tokens supporting action font switch.

```css
--salt-text-action-fontFamily: var(--salt-palette-text-fontFamily-action);

--salt-palette-text-fontFamily-action: var(
  --salt-typography-fontFamily-openSans
);
--salt-palette-text-action-fontWeight: var(
  --salt-typography-fontWeight-semiBold
);
```

Updated `--salt-text-action-fontWeight` to use `var(--salt-palette-text-action-fontWeight)`.

In theme next, palette layer tokens can be switched between Open Sans and Amplitude.

Closes #3528.
