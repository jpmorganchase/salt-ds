---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

- --uitk-palette-opacity-background changed to opacity-2

- Size tokens updated to use unit calculations where density aware

- The following size tokens moved to become density invariant:

--uitk-size-divider-strokeWidth: 1px;
--uitk-size-bottomBorder: 2px;
--uitk-size-brandBar: 4px;

- Pill, Switch, AppHeader, Logo and ToggleGroupButton size tokens moved to respective components

```diff
- --uitk-size-adornment
- --uitk-size-appHeader
- --uitk-size-pill
- --uitk-size-switch
- --uitk-size-logo
- --uitk-size-toggleGroupButton
- --uitk-size-formField-top
```
