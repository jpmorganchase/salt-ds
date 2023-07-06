---
"@salt-ds/theme": minor
---

Deprecated opacity tokens: Use replacement as defined below

```diff
- --salt-opacity-1  // Use --salt-opacity-15
- --salt-opacity-2  // Use --salt-opacity-25
- --salt-opacity-3  // Use --salt-opacity-40
- --salt-opacity-4  // Use --salt-opacity-70
```

Mapped palette opacity tokens to new opacity values.
Added `--salt-palette-opacity-disabled` to encompass `--salt-palette-opacity-border`, `--salt-palette-opacity-background`, `--salt-palette-opacity-foreground`, `--salt-palette-opacity-fill`, `--salt-palette-opacity-stroke`

```diff
- --salt-palette-opacity-background: var(--salt-opacity-3); // Use --salt-palette-opacity-disabled
- --salt-palette-opacity-background-readonly:   var(--salt-opacity-1);
- --salt-palette-opacity-border: var(--salt-opacity-3); // Use --salt-palette-opacity-disabled
- --salt-palette-opacity-border-readonly: var(--salt-opacity-2);
- --salt-palette-opacity-foreground: var(--salt-opacity-4); // Use --salt-palette-opacity-disabled
- --salt-palette-opacity-backdrop: var(--salt-opacity-4);
- --salt-palette-opacity-primary-border: var(--salt-opacity-3);
- --salt-palette-opacity-secondary-border: var(--salt-opacity-2);
- --salt-palette-opacity-tertiary-border: var(--salt-opacity-1);
- --salt-palette-opacity-fill: var(--salt-opacity-3);   // Use --salt-palette-opacity-disabled
- --salt-palette-opacity-stroke: var(--salt-opacity-3); // Use --salt-palette-opacity-disabled
+ --salt-palette-opacity-backdrop: var(--salt-opacity-70);
+ --salt-palette-opacity-disabled: var(--salt-opacity-40);
+ --salt-palette-opacity-background-readonly: var(--salt-opacity-0);
+ --salt-palette-opacity-border-readonly: var(--salt-opacity-8);
+ --salt-palette-opacity-primary-border: var(--salt-opacity-40);
+ --salt-palette-opacity-secondary-border: var(--salt-opacity-25);
+ --salt-palette-opacity-tertiary-border: var(--salt-opacity-15);
```
