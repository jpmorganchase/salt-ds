---
"@salt-ds/theme": minor
---

## Characteristics

Added decorative and informative status foreground tokens. This ensures contrast requirements are met for both text and non-text elements.

```diff
+  --salt-status-info-foreground-decorative: var(--salt-palette-info-foreground-decorative);
+  --salt-status-error-foreground-decorative: var(--salt-palette-error-foreground-decorative);
+  --salt-status-warning-foreground-decorative: var(--salt-palette-warning-foreground-decorative);
+  --salt-status-success-foreground-decorative: var(--salt-palette-success-foreground-decorative);
+
+  --salt-status-info-foreground-informative: var(--salt-palette-info-foreground-informative);
+  --salt-status-error-foreground-informative: var(--salt-palette-error-foreground-informative);
+  --salt-status-warning-foreground-informative: var(--salt-palette-warning-foreground-informative);
+  --salt-status-success-foreground-informative: var(--salt-palette-success-foreground-informative);
```

Deprecated status foreground tokens.

| Name                             | Replacement                                 |
| -------------------------------- | ------------------------------------------- |
| --salt-status-info-foreground    | --salt-status-info-foreground-decorative    |
| --salt-status-error-foreground   | --salt-status-error-foreground-decorative   |
| --salt-status-warning-foreground | --salt-status-warning-foreground-decorative |
| --salt-status-success-foreground | --salt-status-success-foreground-decorative |

## Palette

Added decorative and informative info, error, warning and success foreground tokens.

### Light

```diff
+  --salt-palette-info-foreground-decorative: var(--salt-color-blue-500);
+  --salt-palette-info-foreground-informative: var(--salt-color-blue-600);
+  --salt-palette-error-foreground-decorative: var(--salt-color-red-500);
+  --salt-palette-error-foreground-informative: var(--salt-color-red-600);
+  --salt-palette-warning-foreground-decorative: var(--salt-color-orange-700);
+  --salt-palette-warning-foreground-informative: var(--salt-color-orange-850);
+  --salt-palette-success-foreground-decorative: var(--salt-color-green-500);
+  --salt-palette-success-foreground-informative: var(--salt-color-green-600);
```

### Dark

```diff
+  --salt-palette-info-foreground-decorative: var(--salt-color-blue-100);
+  --salt-palette-info-foreground-informative: var(--salt-color-blue-200);
+  --salt-palette-error-foreground-decorative: var(--salt-color-red-500);
+  --salt-palette-error-foreground-informative: var(--salt-color-red-200);
+  --salt-palette-warning-foreground-decorative: var(--salt-color-orange-500);
+  --salt-palette-warning-foreground-informative: var(--salt-color-orange-400);
+  --salt-palette-success-foreground-decorative: var(--salt-color-green-400);
+  --salt-palette-success-foreground-informative: var(--salt-color-green-200);
```

Deprecated status foreground tokens.

| Name                              | Replacement                                  |
| --------------------------------- | -------------------------------------------- |
| --salt-palette-info-foreground    | --salt-palette-info-foreground-decorative    |
| --salt-palette-error-foreground   | --salt-palette-error-foreground-decorative   |
| --salt-palette-warning-foreground | --salt-palette-warning-foreground-decorative |
| --salt-palette-success-foreground | --salt-palette-success-foreground-decorative |

## Foundations

Added `--salt-color-orange-850`:

```diff
+  --salt-color-orange-850: rgb(194, 52, 7);
```
