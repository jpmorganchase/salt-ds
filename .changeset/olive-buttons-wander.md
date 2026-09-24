---
"@salt-ds/core": patch
---

Fixed keyboard navigation in `ToggleButtonGroup`.

- Arrow keys no longer scroll the page while moving between buttons.

Fixed selection in a `ToggleButtonGroup` whose buttons use numeric `value` props. Choosing a button left every button in the group reporting `aria-checked="false"`, so a screen reader announced nothing as selected. The group also reported a change when the already selected button was chosen again.

Removed the invalid `readOnly` attribute that `ToggleButton` rendered onto its `button` element. Read-only state is still exposed through `aria-readonly`.
