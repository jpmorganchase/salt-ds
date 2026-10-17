---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
---

Components that had a fixed height now grow taller to fit their content instead of letting it overflow. This happens when a label wraps onto more than one line or when users enlarge text, for example with the browser's text-only zoom.

This applies to `Button`, `LinkButton`, `ToggleButton` (including inside `ToggleButtonGroup`), `OnSolidButton`, `Pill`, `Tag`, `Kbd`, `Input`, `NumberInput`, `ComboBox` when it truncates its pills, the `Pagination` page buttons and `GoToInput`, `MenuGroup` labels and `DateInput`.

`Button`, `ToggleButton`, `OnSolidButton` and `Tag` also keep the same space above and below their label as it grows.

At their default sizes, these components look the same as before, and they still don't stretch to the height of neighbouring items in flex or grid layouts. `--saltButton-height`, `--saltLinkButton-height`, `--saltInput-height` and `--saltDateInput-height` still set an exact height.
