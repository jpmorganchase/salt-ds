---
"@salt-ds/lab": patch
---

Calendar updates

- fixed styling issues with selected range border.
- improved screenreader support.
- code hygiene improvements
  - remove un-used code/types and simplified structure of selection types.
- Calendar provides default screen-reader announcements by default.
- Custom live announcements can be configured through a `createAnnouncement` factory method.

```
import { Calendar } from "@salt-ds/lab";
import type { CreateAnnouncement } from "@salt-ds/lab";

const customCreateAnnouncement: CreateAnnouncement<DateFrameworkType> = (announcementType, state, dateAdapter) => {
  switch (minFocusableDateExceeded) {
    case "dateSelected":
      return `Minimum date exceeded ${dateAdapter.format(state.selectedDate, )}`;
    case "maxFocusableDateExceeded":
      return `Maximum date exceeded ${dateAdapter.format(state.selectedDate, )}`;
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
  These props can be used in place of `onNavigateNext`, `disableNavigateNext` and `onNavigatePrevious`, `disableNavigateprevious`.
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
- When a Calendar has a min/maxDate and the user navigates to a month outside of that range, the Calendar will now automatically navigate back to the closest valid month.
