---
"@salt-ds/lab": patch
---

DatePicker and Calendar API improvements

- `CalendarCarousel` has been renamed to `CarouselDateGrid`.
- `Calendar`'s API has been updated so that `CalendarNavigation`, `CalendarWeekHeader` and `CalendarGrid` are provided as `children`. Previously, only `CalendarNavigation` was supported.
  This enables more flexibility in the layout and configuration of the `Calendar` elements.
  A typical Calendar will now look like this:

```
<Calendar selectionVariant="single" hideOutOfRangeDates>
   <CalendarNavigation />
   <CalendarWeekHeader />
   <CalendarGrid />
</Calendar>
```

`CalendarNavigation` - provides year/month dropdowns and forward/back controls for the visible month.
`CalendarWeekHeader` - provides a header for `CalendarGrid` indicating the day of the week.
`CalendarGrid` - provides a grid of buttons representing the days from a calendar month.

- Fixed issues with `Calendar`'s offset selection.
- Calendar's `onSelectionDateChange` prop was renamed to `onSelectionChange` to make `DatePicker`'s API consistent with other components.
