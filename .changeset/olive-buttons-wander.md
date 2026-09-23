---
"@salt-ds/core": patch
---

Fixed keyboard navigation in `ToggleButtonGroup`.

- Arrow keys no longer scroll the page while moving between buttons.
- The group is now a single tab stop, following the ARIA radio group pattern. Previously, before the group had been focused, every button was reachable with Tab, so tabbing through a group of four buttons took four presses instead of one.
- A group whose selected button is disabled can now be reached with Tab. Previously the disabled button was the group's only tab stop, so the whole group was skipped. Tab now moves to the first enabled button.

Fixed selection in a `ToggleButtonGroup` whose buttons use numeric `value` props. Choosing a button left every button in the group reporting `aria-checked="false"`, so a screen reader announced nothing as selected and the group lost its tab stop. The group also reported a change when the already selected button was chosen again.

Removed the invalid `readOnly` attribute that `ToggleButton` rendered onto its `button` element. Read-only state is still exposed through `aria-readonly`.
