---
"@salt-ds/lab": patch
---

- `DatePickerSinglePanel` has been renamed to `DatePickerSingleGridPanel`. This component now provides up to 12 `Calendars` within a panel via the `numberOfVisibleMonths` and `columns` props, enabling multi-month date selection (defaults to 1 visible calendar).

```diff
<DatePicker
  selectionVariant="single"
>
  <DatePickerTrigger>
    <DatePickerSingleInput />
  </DatePickerTrigger>
  <DatePickerOverlay>
    <DatePickerSingleGridPanel numberOfVisibleMonths={12} columns={3} />
  </DatePickerOverlay>
</DatePicker>
```

- `DatePickerRangeGridPanel` has been added. It provides up to 12 Calendars within a panel via the `numberOfVisibleMonths` and `columns` props, enabling multi-month date range selection (defaults to 2 visible calendars and 2 columns).

```
<DatePicker
  selectionVariant="range"
>
  <DatePickerTrigger>
    <DatePickerRangeInput />
  </DatePickerTrigger>
  <DatePickerOverlay>
    <DatePickerRangeGridPanel numberOfVisibleMonths={12} columns={3} />
  </DatePickerOverlay>
</DatePicker>
```

Note: `DatePickerRangePanel` remains unchanged and provides a dual `Calendar` date view, with individual month/year dropdowns for the start and end date range.

- A new `CalendarMonthHeader` component has been added, used by `CalendarGrid` to display a multi-month grid of `Calendar` components.
- `DatePicker` now supports `isDayDisabled`, `isDayUnselectable`, and `isDayHighlighted` props, rather than providing them through the `Calendar` props.
- The `DatePickerOverlayProvider` prop `onOpenChange` has changed signature and `event` has been removed, to create a consistent API with other components.

```diff
- onOpenChange?: ( newOpen: boolean, event?: Event, reason?: DatePickerOpenChangeReason) => void;
+ onOpenChange?: ( newOpen: boolean, reason?: DatePickerOpenChangeReason) => void;
```

- Added `useFocusOut` floating-ui middleware to close the overlay upon focus out.
- Fixed a bug where the change event was triggered by blur when the entered date had not changed.
- Fixed the styling of disabled and unselectable days, which previously used the same style.
- Fixed invalid date ranges so they do not render as selected.
- Fixed a bug for helper text to ensure it wraps during overflow.
