---
"@salt-ds/theme": minor
---

Added new tokens

| Tier | Token | Value |
| Foundation | `--salt-typography-fontFamily-openSans` | "Open Sans" |
| Foundation | `--salt-typography-fontFamily-ptMono` | "PT Mono" |
| Palette | `--salt-palette-text-fontFamily` | `--salt-typography-fontFamily-openSans` |
| Palette | `--salt-palette-text-fontFamily-heading` | `--salt-typography-fontFamily-openSans` |
| Palette | `--salt-palette-text-fontFamily-code` | `--salt-typography-fontFamily-ptMono` |

Updated existing token value mapping to use new tokens

```diff
- --salt-text-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-fontFamily: var(--salt-palette-text-fontFamily);
- --salt-text-notation-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-notation-fontFamily: var(--salt-palette-text-fontFamily);
- --salt-text-h1-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-h1-fontFamily: var(--salt-palette-text-fontFamily-heading);
- --salt-text-h2-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-h2-fontFamily: var(--salt-palette-text-fontFamily-heading);
- --salt-text-h3-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-h3-fontFamily: var(--salt-palette-text-fontFamily-heading);
- --salt-text-h4-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-h4-fontFamily: var(--salt-palette-text-fontFamily-heading);
- --salt-text-label-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-label-fontFamily: var(--salt-palette-text-fontFamily);
- --salt-text-display1-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-display1-fontFamily: var(--salt-palette-text-fontFamily-heading);
- --salt-text-display2-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-display2-fontFamily: var(--salt-palette-text-fontFamily-heading);
- --salt-text-display3-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-display3-fontFamily: var(--salt-palette-text-fontFamily-heading);
- --salt-text-code-fontFamily: var(--salt-typography-fontFamily-code);
+ --salt-text-code-fontFamily: var(--salt-palette-text-fontFamily-code);
```

Deprecated below tokens, use replacement token instead

```
  --salt-typography-fontFamily: var(--salt-typography-fontFamily-openSans);
  --salt-typography-fontFamily-code: var(--salt-typography-fontFamily-ptMono);
```
