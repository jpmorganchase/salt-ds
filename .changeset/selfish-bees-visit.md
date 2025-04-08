---
"@salt-ds/ag-grid-theme": minor
---

Improve overall CSS performance, specially around speed around context menu interaction.

- Replaced most `div[class*="ag-theme-salt"` wildcard attribute selector to spelled out class selector `"ag-theme-salt-light", "ag-theme-salt-dark", "ag-theme-salt-compact-light", "ag-theme-salt-compact-dark"`
- Improved selectors around cell focus ring and input placeholder within filter and column select menu.
