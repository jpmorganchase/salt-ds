---
"@salt-ds/theme": minor
---

Added new tokens in Salt theme.

```diff
+ --salt-palette-interact-cta-border-hover: var(--salt-color-blue-500);
+ --salt-palette-interact-cta-border-active: var(--salt-color-blue-700);
```

Updated mapping for below tokens, to help visual alignment between Salt and Salt Next themes.

```diff
- --salt-actionable-accented-borderColor-hover: var(--salt-palette-interact-border-none);
+ --salt-actionable-accented-borderColor-hover: var(--salt-palette-interact-cta-border-hover);
- --salt-actionable-accented-borderColor-active: var(--salt-palette-interact-border-none);
+ --salt-actionable-accented-borderColor-active: var(--salt-palette-interact-cta-border-active);
```
