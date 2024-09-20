---
"@salt-ds/theme": minor
---

Added new tokens in Salt theme.

- `--salt-palette-interact-cta-border-hover`
- `--salt-palette-interact-cta-border-active`
- `--salt-accent-background-disabled`
- `--salt-palette-accent-background-disabled`

Added new tokens in Salt Next theme.

- `--salt-accent-background-disabled`

Updated mapping for below tokens, to help visual alignment between Salt and Salt Next themes.

```diff
- --salt-actionable-accented-borderColor-hover: var(--salt-palette-interact-border-none);
+ --salt-actionable-accented-borderColor-hover: var(--salt-palette-interact-cta-border-hover);
- --salt-actionable-accented-borderColor-active: var(--salt-palette-interact-border-none);
+ --salt-actionable-accented-borderColor-active: var(--salt-palette-interact-cta-border-active);
```
