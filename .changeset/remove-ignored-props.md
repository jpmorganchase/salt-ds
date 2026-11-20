---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
"@salt-ds/embla-carousel": patch
---

Removed props that components ignored, always replaced, or put on the wrong element from their types, so they no longer appear in editors or the props tables. Passing them never had an effect, or broke the component.

- `Checkbox` no longer accepts input attributes, such as `required`, `type`, `placeholder` and `pattern`, which were applied to its `label` element. Pass them in `inputProps`. It now accepts `label` attributes, such as `htmlFor`.
- `FormField`: `labelId` and `helperTextId`. The IDs are always generated from `id`.
- `ListBox`: `open`, `defaultOpen` and `readOnly`.
- `StatusAdornment`: `size`.
- `Toolbar`: `role` and `aria-orientation`. `Tooltip`: `role`, which is always `"tooltip"`.
- `SplitLayout` and `Paginator`: `children`. `DialogCloseButton`, `DrawerCloseButton`, `OverlayPanelCloseButton` and `SidePanelCloseButton`: `children`.
- `Calendar` and `useCalendar`: `isOutsideAllowedDates`, `isDaySelectable` and `isDayVisible`, which `useCalendar` works out itself. `startDateOffset` and `endDateOffset` can only be set when `selectionVariant` is `"offset"`.
- `CalendarGrid`: `date` and `month` in `CalendarDayProps`, and `month` in `CalendarMonthHeaderProps`. `CalendarMonthHeaderProps` is now exported.
- `DateInputRange` and `DatePickerRangeInput`: `inputProps`, `startAdornment` and `textAlign`. Use `startInputProps` and `endInputProps`.
- `DatePickerSingleInput` and `DatePickerRangeInput`: `date` and `defaultDate`. Set the date on `DatePicker` with `selectedDate` or `defaultSelectedDate`.
- `DatePickerRangeGridPanel`: `startDate` and `endDate`.
- The `CalendarProps` of `DatePickerSingleGridPanel` and `DatePickerRangeGridPanel`, and the `StartCalendarProps` and `EndCalendarProps` of `DatePickerRangePanel`: `children` and `createAnnouncement`, which the panels replace, `defaultVisibleMonth`, which the panels' visible month overrides, and `visibleMonth` and `focusedDate`, plus `onFocusedDateChange` and `onHoveredDateChange` on the grid panels, which broke keyboard navigation in the panels. Set them on the panel or `DatePicker` instead.
