---
"@salt-ds/lab": minor
---

Date-related components and utilities are no longer re-exported from `@salt-ds/lab`. Update the import source to `@salt-ds/date-components`.

The exact set of components depends on the selection variant you're using.

**Single-date selection** (`DateInputSingle`, single `DatePicker`, `DatePickerSingleInput`, `DatePickerSingleGridPanel`, single `Calendar`):

```diff
  import {
    type DateInputSingleDetails,
    DateInputSingle,
    DatePicker,
    DatePickerOverlay,
    DatePickerSingleGridPanel,
    DatePickerSingleInput,
    DatePickerTrigger,
    type SingleDateSelection,
    Calendar,
    CalendarGrid,
    CalendarNavigation,
    LocalizationProvider,
    useLocalization,
- } from "@salt-ds/lab";
+ } from "@salt-ds/date-components";
```

**Range selection** (`DateInputRange`, range `DatePicker`, `DatePickerRangeInput`, `DatePickerRangePanel`, `DatePickerRangeGridPanel`, range `Calendar`):

```diff
  import {
    type DateInputRangeDetails,
    DateInputRange,
    DatePicker,
    DatePickerOverlay,
    DatePickerRangeGridPanel,
    DatePickerRangeInput,
    DatePickerRangePanel,
    DatePickerTrigger,
    type DateRangeSelection,
    Calendar,
    CalendarGrid,
    CalendarNavigation,
    LocalizationProvider,
    useLocalization,
- } from "@salt-ds/lab";
+ } from "@salt-ds/date-components";
```

**Offset selection** (offset `Calendar`; offset `DatePicker` built from the range input + range panel with `selectionVariant="offset"`):

```diff
  import {
    type DateRangeSelection,
    Calendar,
    CalendarGrid,
    CalendarNavigation,
    DatePicker,
    DatePickerOverlay,
    DatePickerRangeInput,
    DatePickerRangePanel,
    DatePickerTrigger,
    LocalizationProvider,
    useLocalization,
- } from "@salt-ds/lab";
+ } from "@salt-ds/date-components";
```
