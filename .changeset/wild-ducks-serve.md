---
"@salt-ds/lab": patch
---

Visual updates for `CalendarDay` rendering

- refactored the `CalendarMonth` grid to make selection accomodate the 1px spacing between cells.
- refactored `CalendarWeekHeader` to make it align with refactored `CalendarMonth`.
- removed usage of `small` text style.
- range selection with rounded corners fixed.

Visual updates for `Calendar` rendering

- applied a min-width of 4.3em to year dropdown to avoid overflow when zoomed.

Visual updates for `DatePicker` rendering

- use bordered buttons for cancel action in `DatePickerActions`.
