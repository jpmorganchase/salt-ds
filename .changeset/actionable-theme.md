---
"@salt-ds/theme": minor
---

Updated tokens values mapping for below tokens

```diff
/* light */
- --salt-palette-negative-foreground: var(--salt-color-red-700);
+ --salt-palette-negative-foreground: var(--salt-color-red-600);
- --salt-palette-positive-foreground: var(--salt-color-green-700);
+ --salt-palette-positive-foreground: var(--salt-color-green-600);
/* dark */
- --salt-palette-negative-foreground: var(--salt-color-red-300);
+ --salt-palette-negative-foreground: var(--salt-color-red-200);
- --salt-palette-positive-foreground: var(--salt-color-green-300);
+ --salt-palette-positive-foreground: var(--salt-color-green-200);
```

Deprecated actionable cta/primary/secondary tokens in favor of new tokens. Replacement references below

| Deprecated token                                   | Replacement token                                      |
| -------------------------------------------------- | ------------------------------------------------------ |
| `--salt-actionable-cta-background-active`          | `--salt-actionable-accented-bold-background-active`    |
| `--salt-actionable-cta-background-disabled`        | `--salt-actionable-accented-bold-background-disabled`  |
| `--salt-actionable-cta-background-hover`           | `--salt-actionable-accented-bold-background-hover`     |
| `--salt-actionable-cta-background`                 | `--salt-actionable-accented-bold-background`           |
| `--salt-actionable-cta-borderColor-active`         | `--salt-actionable-accented-bold-borderColor-active`   |
| `--salt-actionable-cta-borderColor-disabled`       | `--salt-actionable-accented-bold-borderColor-disabled` |
| `--salt-actionable-cta-borderColor-hover`          | `--salt-actionable-accented-bold-borderColor-hover`    |
| `--salt-actionable-cta-borderColor`                | `--salt-actionable-accented-bold-borderColor`          |
| `--salt-actionable-cta-foreground-active`          | `--salt-actionable-accented-bold-foreground-active`    |
| `--salt-actionable-cta-foreground-disabled`        | `--salt-actionable-accented-bold-foreground-disabled`  |
| `--salt-actionable-cta-foreground-hover`           | `--salt-actionable-accented-bold-foreground-hover`     |
| `--salt-actionable-cta-foreground`                 | `--salt-actionable-accented-bold-foreground`           |
| `--salt-actionable-primary-background-active`      | `--salt-actionable-bold-background-active`             |
| `--salt-actionable-primary-background-disabled`    | `--salt-actionable-bold-background-disabled`           |
| `--salt-actionable-primary-background-hover`       | `--salt-actionable-bold-background-hover`              |
| `--salt-actionable-primary-background`             | `--salt-actionable-bold-background`                    |
| `--salt-actionable-primary-borderColor-active`     | `--salt-actionable-bold-borderColor-active`            |
| `--salt-actionable-primary-borderColor-disabled`   | `--salt-actionable-bold-borderColor-disabled`          |
| `--salt-actionable-primary-borderColor-hover`      | `--salt-actionable-bold-borderColor-hover`             |
| `--salt-actionable-primary-borderColor`            | `--salt-actionable-bold-borderColor`                   |
| `--salt-actionable-primary-foreground-active`      | `--salt-actionable-bold-foreground-active`             |
| `--salt-actionable-primary-foreground-disabled`    | `--salt-actionable-bold-foreground-disabled`           |
| `--salt-actionable-primary-foreground-hover`       | `--salt-actionable-bold-foreground-hover`              |
| `--salt-actionable-primary-foreground`             | `--salt-actionable-bold-foreground`                    |
| `--salt-actionable-secondary-background-active`    | `--salt-actionable-subtle-background-active`           |
| `--salt-actionable-secondary-background-disabled`  | `--salt-actionable-subtle-background-disabled`         |
| `--salt-actionable-secondary-background-hover`     | `--salt-actionable-subtle-background-hover`            |
| `--salt-actionable-secondary-background`           | `--salt-actionable-subtle-background`                  |
| `--salt-actionable-secondary-borderColor-active`   | `--salt-actionable-subtle-borderColor-active`          |
| `--salt-actionable-secondary-borderColor-disabled` | `--salt-actionable-subtle-borderColor-disabled`        |
| `--salt-actionable-secondary-borderColor-hover`    | `--salt-actionable-subtle-borderColor-hover`           |
| `--salt-actionable-secondary-borderColor`          | `--salt-actionable-subtle-borderColor`                 |
| `--salt-actionable-secondary-foreground-active`    | `--salt-actionable-subtle-foreground-active`           |
| `--salt-actionable-secondary-foreground-disabled`  | `--salt-actionable-subtle-foreground-disabled`         |
| `--salt-actionable-secondary-foreground-hover`     | `--salt-actionable-subtle-foreground-hover`            |
| `--salt-actionable-secondary-foreground`           | `--salt-actionable-subtle-foreground`                  |

Added various tokens for new Button variants.

## Salt theme - `theme.css`

### Palette

- `--salt-palette-accent-border-disabled`
- `--salt-palette-accent-foreground-informative`
- `--salt-palette-accent-foreground-informative-disabled`
- `--salt-palette-interact-border-none`
- `--salt-palette-negative-foreground-disabled`
- `--salt-palette-negative-background`
- `--salt-palette-negative-background-hover`
- `--salt-palette-negative-background-active`
- `--salt-palette-negative-background-disabled`
- `--salt-palette-negative-border`
- `--salt-palette-negative-border-disabled`
- `--salt-palette-positive-foreground-disabled`
- `--salt-palette-positive-background`
- `--salt-palette-positive-background-hover`
- `--salt-palette-positive-background-active`
- `--salt-palette-positive-background-disabled`
- `--salt-palette-positive-border`
- `--salt-palette-positive-border-disabled`
- `--salt-palette-warning-border-disabled`
- `--salt-palette-warning-foreground-informative-disabled`
- `--salt-palette-warning-action`
- `--salt-palette-warning-action-hover`
- `--salt-palette-warning-action-active`
- `--salt-palette-warning-action-disabled`
- `--salt-palette-warning-action-foreground`
- `--salt-palette-warning-action-foreground-disabled`

#### Foundation

- `--salt-color-blue-200-fade-foreground`
- `--salt-color-green-200-fade-foreground`
- `--salt-color-green-600-fade-foreground`
- `--salt-color-red-200-fade-foreground`
- `--salt-color-red-600-fade-foreground`
- `--salt-color-orange-400-fade-foreground`
- `--salt-color-orange-850-fade-foreground`
- `--salt-color-green-500-fade-background`
- `--salt-color-green-600-fade-background`
- `--salt-color-red-600-fade-background`

## Salt next theme - `theme-next.css`

### Palette

- `--salt-palette-negative-action-hover`
- `--salt-palette-negative-action-active`
- `--salt-palette-negative-disabled`
- `--salt-palette-positive-action-hover`
- `--salt-palette-positive-action-active`
- `--salt-palette-positive-disabled`
- `--salt-palette-warning-disabled`
- `--salt-palette-warning-action-hover`
- `--salt-palette-warning-action-active`
