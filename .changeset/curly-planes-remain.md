---
"@salt-ds/date-components": minor
---

## New package: `@salt-ds/date-components`

A new package, `@salt-ds/date-components`, has been introduced as the long-term home for shared date-related components and utilities (for example `Calendar`, `CalendarNavigation`, and `DateInput`).

To avoid a breaking change while these components remain in release-candidate status, `@salt-ds/lab` continues to re-export the same APIs for now and will emit a deprecation warning in development. New code should import directly from `@salt-ds/date-components`.

## Calendar

- Fixed styling issues with the selected range border.
- Fixed Calendar dropdown spacing that caused an ellipsis to appear at mobile breakpoints.
- Improved screen reader support.
- Type improvements:
  - Removed unused code/types and simplified selection type structures.
  - Simplified adapter generics; consumers typically no longer need to provide generics unless implementing a custom date adapter.
- Calendar now provides default screen reader announcements.
- Custom live announcements can be configured via the `createAnnouncement` factory.

```tsx
import { Calendar } from "@salt-ds/date-components";
import type { CreateAnnouncement } from "@salt-ds/date-components";

const customCreateAnnouncement: CreateAnnouncement<DateFrameworkType> = (
  announcementType,
  state,
  dateAdapter,
) => {
  switch (announcementType) {
    case "minFocusableDateExceeded":
      return `Minimum date exceeded ${dateAdapter.format(state.selectedDate)}`;
    case "maxFocusableDateExceeded":
      return `Maximum date exceeded ${dateAdapter.format(state.selectedDate)}`;
    case "dateSelected":
      return `You selected ${dateAdapter.format(state.selectedDate, "longDate")}`;
    case "visibleMonthChanged":
      return `Selected ${dateAdapter.format(state.startVisibleMonth, "monthYear")}`;
    default:
      return undefined;
  }
};

<Calendar createAnnouncement={customCreateAnnouncement} timezone="UTC" />;
```

### `CalendarNavigation` API updates

- Added `PreviousButtonProps` and `NextButtonProps` to pass props to the navigation buttons. These can be used instead of `onNavigateNext`, `disableNavigateNext`, `onNavigatePrevious`, and `disableNavigatePrevious`.
- Removed `onMonthSelect` and `onYearSelect`. Use `MonthDropdownProps` and `YearDropdownProps` instead.

```diff
<CalendarNavigation
-  onMonthSelect={handleMonthSelect}
+  MonthDropdownProps={{
+    onChange: handleMonthSelect
+  }}
-  onYearSelect={handleYearSelect}
+  YearDropdownProps={{
+    onChange: handleYearSelect
+  }}
-  onNavigatePrevious={handlePrevious}
-  disableNavigatePrevious={isPreviousDisabled}
+  PreviousButtonProps={{
+    onClick: handlePrevious,
+    disabled: isPreviousDisabled
+  }}
-  onNavigateNext={handleNext}
-  disableNavigateNext={isNextDisabled}
+  NextButtonProps={{
+    onClick: handleNext,
+    disabled: isNextDisabled
+  }}
/>
```

- `CalendarNavigation` now adds tooltips to out-of-range dates.
- When a Calendar has `minDate` or `maxDate` and the user navigates outside that range, it will automatically navigate back to the closest valid month.

## DateInput

- Accessibility improvements for `DateInputSingle` and `DateInputRange`.
- Day.js timezone improvements for `DateInputSingle` and `DateInputRange`.
- Added `aria-invalid` to `DateInputSingle` and `DateInputRange` input elements when an error is present.

## DatePicker

- Fixed a bug where a disabled picker could still open by clicking the input
- Improved screen reader support
- Fix DatePicker calendar visible month when user enters out of range date in the input and opens the calendar. The calendar will now open to the closest valid month instead of the current month.
- Fix the error type for `defaultRangeValidator` in `DatePickerRangeInput` (contributed by @VAIBHAVHATISKAR21)
