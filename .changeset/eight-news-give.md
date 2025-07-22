---
"@salt-ds/theme": minor
---

Fixed `-weak` suffix in palette and characteristic tokens for negative, positive, info, and warning, where `-weakest` should have been used.

Deprecated the following `-weak` palette tokens and renamed to the correct:

| Name                           | Replacement                       |
| ------------------------------ | --------------------------------- |
| `--salt-palette-positive-weak` | `--salt-palette-positive-weakest` |
| `--salt-palette-negative-weak` | `--salt-palette-negative-weakest` |
| `--salt-palette-warning-weak`  | `--salt-palette-warning-weakest`  |
| `--salt-palette-info-weak`     | `--salt-palette-info-weakest`     |
