---
"@salt-ds/theme": minor
---

Updated H1 font weight

| H1      | Before     | New       |
| ------- | ---------- | --------- |
| Default | Bold       | Semi bold |
| Small   | Medium     | Regular   |
| Strong  | Extra bold | Bold      |

Added font weight in palette layer for display, heading, body and notation.

```diff
+ --salt-palette-text-display-fontWeight: var(--salt-typography-fontWeight-semiBold);
+ --salt-palette-text-display-fontWeight-strong: var(--salt-typography-fontWeight-bold);
+ --salt-palette-text-display-fontWeight-small: var(--salt-typography-fontWeight-regular);
+ --salt-palette-text-heading-fontWeight: var(--salt-typography-fontWeight-semiBold);
+ --salt-palette-text-heading-fontWeight-small: var(--salt-typography-fontWeight-regular);
+ --salt-palette-text-heading-fontWeight-strong: var(--salt-typography-fontWeight-bold);
+ --salt-palette-text-body-fontWeight: var(--salt-typography-fontWeight-regular);
+ --salt-palette-text-body-fontWeight-small: var(--salt-typography-fontWeight-light);
+ --salt-palette-text-body-fontWeight-strong: var(--salt-typography-fontWeight-semiBold);
+ --salt-palette-text-notation-fontWeight: var(--salt-typography-fontWeight-semiBold);
+ --salt-palette-text-notation-fontWeight-small: var(--salt-typography-fontWeight-regular);
+ --salt-palette-text-notation-fontWeight-strong: var(--salt-typography-fontWeight-bold);
```

Wired text characteristics font weight to newly added palette tokens.

In theme next, when Amplitude is used for heading, font weight will be adjusted accordingly.
