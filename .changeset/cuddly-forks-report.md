---
"@salt-ds/theme": minor
---

Changed opacity foundation to a new scaled system.
Deprecated tokens `--salt-opacity-1`, `--salt-opacity-2`, `--salt-opacity-3`, `--salt-opacity-4`.

| Foundation token (deprecated) | Value | Use instead       |
| ----------------------------- | ----- | ----------------- |
| --salt-opacity-1              | 0.15  | --salt-opacity-15 |
| --salt-opacity-2              | 0.25  | --salt-opacity-25 |
| --salt-opacity-3              | 0.40  | --salt-opacity-40 |
| --salt-opacity-4              | 0.70  | --salt-opacity-70 |

```diff
- --salt-opacity-15: 0.15;
- --salt-opacity-25: 0.25;
- --salt-opacity-40: 0.40;
- --salt-opacity-70: 0.70;
+ --salt-opacity-0: 0.00;
+ --salt-opacity-8: 0.08;
+ --salt-opacity-15: 0.15;
+ --salt-opacity-25: 0.25;
+ --salt-opacity-40: 0.40;
+ --salt-opacity-70: 0.70;
```

Added `--salt-palette-opacity-disabled` of value 0.40 to replace `--salt-palette-opacity-border`, `--salt-palette-opacity-background`, `--salt-palette-opacity-foreground`, `--salt-palette-opacity-fill`, `--salt-palette-opacity-stroke`

| Palette token (deprecated)        | Value  | Use instead                     | New value |
| --------------------------------- | ------ | ------------------------------- | --------- |
| --salt-palette-opacity-background | 0.40   | --salt-palette-opacity-disabled | 0.40      |
| --salt-palette-opacity-border     | 0.40   | --salt-palette-opacity-disabled | 0.40      |
| --salt-palette-opacity-stroke     | 0.40   | --salt-palette-opacity-disabled | 0.40      |
| --salt-palette-opacity-fill       | 0.40   | --salt-palette-opacity-disabled | 0.40      |
| --salt-palette-opacity-foreground | 0.70\* | --salt-palette-opacity-disabled | 0.40      |

\* Usages of `--salt-palette-opacity-foreground` should now map to a value of 0.40 rather than 0.70

Mapped palette opacity tokens to new opacity values

| Palette token                              | Old value              | New value               |
| ------------------------------------------ | ---------------------- | ----------------------- |
| --salt-palette-opacity-background-readonly | --salt-opacity-1: 0.15 | --salt-opacity-0: 0.00  |
| --salt-palette-opacity-border-readonly     | --salt-opacity-2: 0.25 | --salt-opacity-8: 0.08  |
| --salt-palette-opacity-backdrop            | --salt-opacity-4: 0.70 | --salt-opacity-70: 0.70 |
| --salt-palette-opacity-primary-border      | --salt-opacity-3: 0.40 | --salt-opacity-40: 0.40 |
| --salt-palette-opacity-secondary-border    | --salt-opacity-2: 0.25 | --salt-opacity-25: 0.25 |
| --salt-palette-opacity-tertiary-border     | --salt-opacity-1: 0.15 | --salt-opacity-15: 0.15 |

```diff
- --salt-palette-opacity-background: var(--salt-opacity-3);
- --salt-palette-opacity-border: var(--salt-opacity-3);
- --salt-palette-opacity-foreground: var(--salt-opacity-4);
- --salt-palette-opacity-fill: var(--salt-opacity-3);
- --salt-palette-opacity-stroke: var(--salt-opacity-3);
- --salt-palette-opacity-background-readonly:   var(--salt-opacity-1);
- --salt-palette-opacity-border-readonly: var(--salt-opacity-2);
- --salt-palette-opacity-backdrop: var(--salt-opacity-4);
- --salt-palette-opacity-primary-border: var(--salt-opacity-3);
- --salt-palette-opacity-secondary-border: var(--salt-opacity-2);
- --salt-palette-opacity-tertiary-border: var(--salt-opacity-1);
+ --salt-palette-opacity-backdrop: var(--salt-opacity-70);
+ --salt-palette-opacity-background-readonly: var(--salt-opacity-0);
+ --salt-palette-opacity-border-readonly: var(--salt-opacity-8);
+ --salt-palette-opacity-primary-border: var(--salt-opacity-40);
+ --salt-palette-opacity-secondary-border: var(--salt-opacity-25);
+ --salt-palette-opacity-tertiary-border: var(--salt-opacity-15);
+ --salt-palette-opacity-disabled: var(--salt-opacity-40);
```
