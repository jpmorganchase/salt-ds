---
"@salt-ds/core": patch
"@salt-ds/highcharts-theme": patch
"@salt-ds/lab": patch
"@salt-ds/theme": minor
---

Simplified typography tokens so all heading levels share `--salt-text-heading-fontFamily` and `--salt-text-heading-fontWeight` tokens, while all display levels share `--salt-text-display-fontFamily` and `--salt-text-display-fontWeight` tokens. The `small` and `strong` variants follow the same shared naming.

The level-specific font family and weight tokens are deprecated. They remain available as aliases for compatibility but may be removed in a future major version.
