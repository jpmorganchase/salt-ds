---
"@salt-ds/date-components": minor
---

New package `@salt-ds/date-components` has been added to contain shared date-related components such as `Calendar`, `CalendarNavigation`, and `DateInput`.
To avoid a breaking change, `@salt-ds/lab` still re-exports these components for now (and logs a deprecation warning in development). New code should import from `@salt-ds/date-components`.

Calendar updates

- fixed styling issues with selected range border.
- fix Calendar dropdown spacing that caused an ellipsis to appear at mobile breakpoints.
- improved screenreader support.
- type improvements
  - remove un-used code/types and simplified structure of selection types.
  - simplify types, generics for usage of date adapters are no longer essentially required unless you are creating a custom date adapter.
- Calendar provides default screen-reader announcements by default.
- custom live announcements can be configured through a `createAnnouncement` factory method.

```
import { Calendar } from "@salt-ds/lab";
import type { CreateAnnouncement } from "@salt-ds/lab";

const customCreateAnnouncement: CreateAnnouncement<DateFrameworkType> = (announcementType, state, dateAdapter) => {
  switch (minFocusableDateExceeded) {
    case "dateSelected":
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

<Calendar
  createAnnouncement={customCreateAnnouncement}
  timezone="UTC"
/>
```

- `CalendarNavigation` has new props `PreviousButtonProps` and `NextButtonProps` to pass props to the navigation buttons.
  These props can be used in place of `onNavigateNext`, `disableNavigateNext` and `onNavigatePrevious`, `disableNavigatePrevious`.
- `CalendarNavigation` has removed props `onMonthSelect` and `onYearSelect`, use `MonthDropdownProps` and `YearDropdownProps` instead.

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

- `CalendarNavigation` now adds tooltips to out of range dates.
- when a Calendar has `minDate` or `maxDate` and the user navigates to a month outside of that range, the Calendar will now automatically navigate back to the closest valid month.
