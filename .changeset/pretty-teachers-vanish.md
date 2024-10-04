---
"@salt-ds/lab": patch
---

DatePicker and Calendar API improvements

- `CalendarCarousel` has been renamed to `CarouselDateGrid` so it's more obvious of the content
- `Calendar` previously used `children` to define the `CalendarNavigation`.
  We have now changed that so the `children` defines `CalendarNavigation`, `CalendarWeekHeader` and `CalendarGrid`
  This enables more flexibility in both layout and configuration of the `Calendar` elements.
  A typical Calendar will now look like this,

```
<Calendar selectionVariant="single" hideOutOfRangeDates>
   <CalendarNavigation />
   <CalendarWeekHeader />
   <CalendarGrid />
</Calendar>
```

`CalendarNavigation` - provides year/month dropdowns and forward/back controls for the visible month.
`CalendarWeekHeader` - provides a header for `CalendarGrid` indicating the day of the week.
`CalendarGrid` - provides a grid of buttons that represent the days from a calendar month.

- cleaned up selection API, removed `select`, use `setSelectedDate` instead
- fix issues with `Calendar` offset selection
- updated examples, more consistent helper text, error text to match spec
- test improvements to create a known state for tests and avoid failures based on locale differences
- cleaned up Storybook imports in e2e tests
