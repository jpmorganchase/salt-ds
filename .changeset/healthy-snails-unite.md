---
"@salt-ds/theme": minor
---

Added new container ghost charactersitic tokens

```css
--salt-container-ghost-background: var(--salt-palette-alpha-low);
--salt-container-ghost-borderColor: var(--salt-palette-alpha-contrast-low);
```

Added new palette alpha tokens

| New token                                  | Light mode value            | Dark mode value             |
| ------------------------------------------ | --------------------------- | --------------------------- |
| `--salt-palette-alpha-highest`             | var(--salt-color-white-90a) | var(--salt-color-black-90a) |
| `--salt-palette-alpha-higher`              | var(--salt-color-white-80a) | var(--salt-color-black-80a) |
| `--salt-palette-alpha-high`                | var(--salt-color-white-70a) | var(--salt-color-black-70a) |
| `--salt-palette-alpha-mediumHigh`          | var(--salt-color-white-60a) | var(--salt-color-black-60a) |
| `--salt-palette-alpha-medium`              | var(--salt-color-white-50a) | var(--salt-color-black-50a) |
| `--salt-palette-alpha-mediumLow`           | var(--salt-color-white-40a) | var(--salt-color-black-40a) |
| `--salt-palette-alpha-low`                 | var(--salt-color-white-30a) | var(--salt-color-black-30a) |
| `--salt-palette-alpha-lower`               | var(--salt-color-white-20a) | var(--salt-color-black-20a) |
| `--salt-palette-alpha-lowest`              | var(--salt-color-white-10a) | var(--salt-color-black-10a) |
| `--salt-palette-alpha-contrast-highest`    | var(--salt-color-black-90a) | var(--salt-color-white-90a) |
| `--salt-palette-alpha-contrast-higher`     | var(--salt-color-black-80a) | var(--salt-color-white-80a) |
| `--salt-palette-alpha-contrast-high`       | var(--salt-color-black-70a) | var(--salt-color-white-70a) |
| `--salt-palette-alpha-contrast-mediumHigh` | var(--salt-color-black-60a) | var(--salt-color-white-60a) |
| `--salt-palette-alpha-contrast-medium`     | var(--salt-color-black-50a) | var(--salt-color-white-50a) |
| `--salt-palette-alpha-contrast-mediumLow`  | var(--salt-color-black-40a) | var(--salt-color-white-40a) |
| `--salt-palette-alpha-contrast-low`        | var(--salt-color-black-30a) | var(--salt-color-white-30a) |
| `--salt-palette-alpha-contrast-lower`      | var(--salt-color-black-20a) | var(--salt-color-white-20a) |
| `--salt-palette-alpha-contrast-lowest`     | var(--salt-color-black-10a) | var(--salt-color-white-10a) |

Deprecated below palette tokens, use replacement below instead

```css
--salt-palette-alpha: var(--salt-palette-alpha-contrast-low);
--salt-palette-alpha-strong: var(--salt-palette-alpha-contrast-mediumLow);
--salt-palette-alpha-weak: var(--salt-palette-alpha-contrast-lower);
--salt-palette-alpha-weaker: var(--salt-palette-alpha-contrast-lowest);

--salt-palette-alpha-backdrop: var(--salt-palette-alpha-high);
```
