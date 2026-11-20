---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
"@salt-ds/embla-carousel": patch
---

Reworded prop descriptions to follow a consistent pattern: boolean props start with "If `true`, …", callbacks with "Callback fired when …" and props objects with "Props applied to …". Defaults that were only in the description are now `@default` tags, so they show in editors and the props tables. Defaults that come from somewhere else are described in words, such as `SaltProvider`'s theme props inside another `SaltProvider`, `ToggleButton`'s `appearance` and `sentiment` inside a `ToggleButtonGroup`, and `Button`'s `appearance` and `sentiment` when the deprecated `variant` is set.

Corrected descriptions that didn't match the components:

- `CheckboxGroup`'s `wrap` described the opposite of what it does.
- `ListBox`'s `bordered` adds a border when `true`, rather than removing one when `false`.
- `GridLayout`'s and `BorderLayout`'s `columnGap` and `rowGap` default to the value of `gap`, not to fixed values.
- `FlexItem`'s `align` follows the parent's alignment when not set, rather than defaulting to `"start"`.
- `RadioButton`'s `checked` is the checked state of the radio button, not the group's default.
- `Slider`'s and `RangeSlider`'s `constrainLabelPosition` keeps the labels of the first and last marks within the slider.
- `DatePickerRangePanel`'s `EndCalendarProps` are applied to the end `Calendar`.
- The `onClick` passed to `useSidePanel`'s trigger props no longer says that calling `preventDefault` stops the toggle, which the code doesn't do.
- `Avatar`'s default `nameToInitials` uses the first letters of the first two words of `name`, not of every word.
- `Menu`'s `placement` also defaults to `"right-start"` when the menu is positioned with `getVirtualElement`.
- `Slider`'s and `RangeSlider`'s `format` formats the tooltip, `aria-valuetext` and the minimum and maximum values that screen readers announce, not the `minLabel` and `maxLabel`. `accessibleMinText` and `accessibleMaxText` replace "minimum" and "maximum" in what screen readers announce, and when they're set, the value after them isn't formatted. `stepMultiplier` is the number of steps that Page Up and Page Down move by. `showTooltip` also shows the tooltip while the thumb is dragged or focused with the keyboard. The event passed to `onChange` and `onChangeEnd` is `undefined` when the value is changed from the keyboard.
- `useFloatingUI`'s `middleware` replaces the default middleware rather than updating it.
- `DatePicker`'s `minDate` and `maxDate` default to the `LocalizationProvider`'s, which are January 1, 1900 and December 31, 2099 unless set, not 1900 and 2100. Its `createAnnouncement` uses the default announcements when it's `null`, rather than turning them off.
- `DateInputSingle`'s and `DateInputRange`'s `onDateChange` passes `null` whenever the input is empty, and their `timezone` is derived from `date` or `defaultDate`. `DateInputRange`'s `onChange` doesn't receive a date.
- The `focusedDate` passed to `onFocusedDateChange` on `DatePickerSingleGridPanel` and `DatePickerRangeGridPanel` is the new focused date, not the hovered date.
- `DatePickerOverlayProvider`'s `disabled` only stops the overlay from opening on click.
