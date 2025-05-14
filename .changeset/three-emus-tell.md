---
"@salt-ds/lab": patch
---

- `DatePickerSinglePanel` has been deprecated, use `DatePickerSingleGridPanel` instead.
- `DatePickerSinglePanel` has been renamed to `DatePickerSingleGridPanel` to align the naming with `DatePickerRangeGridPanel`. This component now provides up to 12 `Calendars` within a panel via the `numberOfVisibleMonths` and `columns` props, enabling multi-month date selection (defaults to 1 visible calendar).

```
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

- `CalendarWeekHeader` is now rendered by `CalendarGrid` and can be customized using the `CalendarWeekHeaderProps` prop. If you currently use `CalendarWeekHeader`, you may see two day of week headers, so delete the version from your code.
- `CalendarMonthHeader` is now rendered by `CalendarGrid` and can be customized using the `CalendarMonthHeaderProps` prop.
- A new `CalendarMonthHeader` component has been added, used by `CalendarGrid` to display a multi-month grid of `Calendar` components.
- `DatePickerRangePanel` props `StartCalendarWeekHeaderProps` and `EndCalendarWeekHeaderProps` removed.
  Pass props to `CalendarWeekHeader` using `StartCalendarGridProps -> CalendarWeekHeaderProps` and `EndCalendarGridProps -> CalendarWeekHeaderProps`.

```
<DatePicker
  selectionVariant="range"
>
  <DatePickerTrigger>
    <DatePickerRangeInput />
  </DatePickerTrigger>
  <DatePickerOverlay>
    <DatePickerRangePanel
     StartCalendarGridProps={{ CalendarWeekHeaderProps: { "data-test-id" : "some value" }}}
     EndCalendarGridProps={{ CalendarWeekHeaderProps: { "data-test-id" : "some value" }}}
     />
  </DatePickerOverlay>
</DatePicker>
```

- `DatePicker` now supports `isDayDisabled`, `isDayUnselectable`, and `isDayHighlighted` props, rather than providing them through the `Calendar` props.
- The `DatePickerOverlayProvider` prop `onOpenChange` has changed signature and `event` has been removed, to create a consistent API with other components.

```diff
- onOpenChange?: ( newOpen: boolean, event?: Event, reason?: DatePickerOpenChangeReason) => void;
+ onOpenChange?: ( newOpen: boolean, reason?: DatePickerOpenChangeReason) => void;
```

- DatePicker helper text simplified and resizing bug fixed

In our DatePicker examples, we demonstrate how to include helper text when using a DatePicker within a FormField.
The design requires the helper text to move inside the panel when the DatePicker is opened.
However, this caused a resizing issue with the original date input.

To resolve this, we have refactored the implementation by introducing a `DatePickerHelperText` component.
This component is used as a child of the `DatePicker`, streamlining the process and removing the need for users to manage the visibility of the helper text themselves.

```diff
- <FormField validationStatus={validationStatus}>
-   <FormLabel>Select a date</FormLabel>
-   <DatePicker
-     selectionVariant={"single"}
-   >
-     <DatePickerTrigger>
-       <DatePickerSingleInput />
-     </DatePickerTrigger>
-     <DatePickerOverlay>
-       <DatePickerSingleGridPanel
-         helperText={helperText}
-       />
-       <DatePickerHelperText>{helperText}</DatePickerHelperText>
-     </DatePickerOverlay>
-   </DatePicker>
-   {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
- </FormField>
+ <FormField validationStatus={validationStatus}>
+   <FormLabel>Select a date</FormLabel>
+   <DatePicker
+     selectionVariant={"single"}
+   >
+     <DatePickerTrigger>
+       <DatePickerSingleInput />
+     </DatePickerTrigger>
+     <DatePickerOverlay>
+       <DatePickerSingleGridPanel
+         helperText={helperText}
+       />
+     </DatePickerOverlay>
+     <DatePickerHelperText>{helperText}</DatePickerHelperText>
+   </DatePicker>
+ </FormField>
```

- Added `useFocusOut` floating-ui middleware to close the overlay upon focus out.
- Fixed a bug where the change event was triggered by blur when the entered date had not changed.
- Fixed the styling of disabled and unselectable days, which previously used the same style.
- Fixed invalid date ranges so they do not render as selected.
- Fixed a bug for helper text to ensure it wraps during overflow.
- Timezone prop added to date components, `DatePicker`, `DatePickerSingleInput`, `DatePickerRangeInput`, `DateInputSingle`, `DateInputRange`, `Calendar`.
  The `timezone` prop defines the timezone for the date components, when working with dates and times, it is important to ensure that the correct timezone is applied to avoid confusion and errors.
  If not working with times, the timezone can still affect the date displayed, as the date may be interpreted in a different timezone than intended.
  For this reason, when working with dates, it is recommended to always set the timezone to ensure that the date is displayed correctly.
  "UTC" is a cross-platform standard and is the most common timezone used in programming but may require you to convert to your local timezone for display purposes.
  If `timezone` is not set the timezone will be defined by the default behaviour of your configured date framework.
  The `timezone` prop can be set to one of the following values:
- If undefined, the timezone will be derived from the passed date, or from `defaultSelectedDate`/`selectedDate` or "default" if no date is defined.
- If set to "default", the default timezone of the date library will be used.
- If set to "system", the local system's timezone will be applied.
- If set to "UTC", the time will be returned in UTC.
- If set to a valid IANA timezone identifier, the time will be returned for that specific timezone.
  Timezone is not supported by v3 of `date-fns`, so if you are using `date-fns` v3, the timezone will be set to "default" by default. If you require timezone support, use a date framework such as `luxon` or `dayjs`.
- `Calendar` could render custom contents but did not provide a way to change the highlight styles, so `renderDayContents` has been replaced with `renderDayButton`.

```
function renderDayButton(
   date: DateFrameworkType,
   { className, ...props }: ComponentPropsWithRef<"button">,
   status: DayStatus,
): ReactElement | null {
   return (
      <button
        {...props}
        className={clsx([{ buttonWithDot: !status.outOfRange }, className])}
      >
        <span className={clsx({ dot: !status.outOfRange })}>
          {dateAdapter.format(date, "D")}
        </span>
        {status.today ? <span aria-label={"today"}></span> : null}
      </button>
   );
}

<Calendar hideOutOfRangeDates {...args}>
  <CalendarNavigation />
  <CalendarGrid
     getCalendarMonthProps={(_date: DateFrameworkType) => ({
        renderDayButton,
     })}
   />
</Calendar>
```
