---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
"@jpmorganchase/uitk-theme": minor
---

--uitk-palette-opacity-background changed to opacity-2

Size tokens updated to use unit calculations where density aware

Pill, Switch, AppHeader, Logo and ToggleGroupButton size tokens moved to respective components:
--uitk-size-adornment -> Input --input-adornment-height
--uitk-size-appHeader --> AppHeader --appHeader-height
--uitk-size-pill -> Pill --pill-height
--uitk-size-switch -> Switch --switch-height
--uitk-size-logo -> Logo --logo-height
--uitk-size-toggleGroupButton -> ToggleGroupButton --toggleButton-group-height

Deleted:
--uitk-size-formField-top

Moved to become density invariant:
--uitk-size-divider-strokeWidth: 1px;
--uitk-size-bottomBorder: 2px;
--uitk-size-brandBar: 4px;
