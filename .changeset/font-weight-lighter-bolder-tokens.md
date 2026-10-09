---
"@salt-ds/theme": minor
"@salt-ds/core": patch
"@salt-ds/lab": patch
"@salt-ds/date-components": patch
"@salt-ds/ag-grid-theme": patch
"@salt-ds/highcharts-theme": patch
---

Renamed the `small` and `strong` font weight tokens to `lighter` and `bolder`, to match the `lighter` and `bolder` values of the `fontWeight` prop on `Text`.

Added the following tokens:

- `--salt-text-fontWeight-lighter`
- `--salt-text-fontWeight-bolder`
- `--salt-text-action-fontWeight-lighter`
- `--salt-text-action-fontWeight-bolder`
- `--salt-text-display-fontWeight-lighter`
- `--salt-text-display-fontWeight-bolder`
- `--salt-text-heading-fontWeight-lighter`
- `--salt-text-heading-fontWeight-bolder`
- `--salt-text-label-fontWeight-lighter`
- `--salt-text-label-fontWeight-bolder`
- `--salt-text-notation-fontWeight-lighter`
- `--salt-text-notation-fontWeight-bolder`

Deprecated the following tokens:

| Deprecated token                         | Use instead                               |
| ---------------------------------------- | ----------------------------------------- |
| `--salt-text-fontWeight-small`           | `--salt-text-fontWeight-lighter`          |
| `--salt-text-fontWeight-strong`          | `--salt-text-fontWeight-bolder`           |
| `--salt-text-action-fontWeight-small`    | `--salt-text-action-fontWeight-lighter`   |
| `--salt-text-action-fontWeight-strong`   | `--salt-text-action-fontWeight-bolder`    |
| `--salt-text-display-fontWeight-small`   | `--salt-text-display-fontWeight-lighter`  |
| `--salt-text-display-fontWeight-strong`  | `--salt-text-display-fontWeight-bolder`   |
| `--salt-text-heading-fontWeight-small`   | `--salt-text-heading-fontWeight-lighter`  |
| `--salt-text-heading-fontWeight-strong`  | `--salt-text-heading-fontWeight-bolder`   |
| `--salt-text-label-fontWeight-small`     | `--salt-text-label-fontWeight-lighter`    |
| `--salt-text-label-fontWeight-strong`    | `--salt-text-label-fontWeight-bolder`     |
| `--salt-text-notation-fontWeight-small`  | `--salt-text-notation-fontWeight-lighter` |
| `--salt-text-notation-fontWeight-strong` | `--salt-text-notation-fontWeight-bolder`  |

The deprecated tokens remain available as aliases of the new tokens for compatibility but may be removed in a future major version. Salt components now use the new tokens, so if you override a deprecated token, override the new token instead.

```diff
- font-weight: var(--salt-text-fontWeight-strong);
+ font-weight: var(--salt-text-fontWeight-bolder);
```

The deprecated level-specific `--salt-text-h{1-4}-fontWeight-small`, `--salt-text-h{1-4}-fontWeight-strong`, `--salt-text-display{1-4}-fontWeight-small` and `--salt-text-display{1-4}-fontWeight-strong` tokens now alias the new `lighter` and `bolder` tokens.

The experimental Salt (Interim) theme uses the new token names and doesn't include the deprecated aliases.
