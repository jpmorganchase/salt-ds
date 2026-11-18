---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
"@salt-ds/embla-carousel": patch
---

Reworded prop descriptions to follow a consistent pattern: boolean props start with "If `true`, …", callbacks with "Callback fired when …" and props objects with "Props applied to …". Defaults that were only in the description are now `@default` tags, so they show in editors and the props tables.

Corrected descriptions that didn't match the components:

- `CheckboxGroup`'s `wrap` described the opposite of what it does.
- `ListBox`'s `bordered` adds a border when `true`, rather than removing one when `false`.
- `GridLayout`'s and `BorderLayout`'s `columnGap` and `rowGap` default to the value of `gap`, not to fixed values.
- `FlexItem`'s `align` follows the parent's alignment when not set, rather than defaulting to `"start"`.
- `RadioButton`'s `checked` is the checked state of the radio button, not the group's default.
- `Slider`'s and `RangeSlider`'s `constrainLabelPosition` keeps the labels of the first and last marks within the slider.
- `DatePickerRangePanel`'s `EndCalendarProps` are applied to the end `Calendar`.
- The `onClick` passed to `useSidePanel`'s trigger props no longer says that calling `preventDefault` stops the toggle, which the code doesn't do.
