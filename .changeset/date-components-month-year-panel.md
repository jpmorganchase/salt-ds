---
"@salt-ds/date-components": minor
---

Added `MonthYearSinglePanel` and `MonthYearRangePanel` (plus a shared `MonthGrid` subcomponent) for selecting a month/year or month/year range inside the existing `DatePicker` composition. The panels drop into `DatePickerOverlay` with the same DX as the day-grid panels, honour `DatePickerContext` (`minDate`, `maxDate`, `timezone`, `readOnly`, `disabled`), support controlled and uncontrolled `visibleYear`, and expose an `isMonthUnselectable` hook for per-month disabling. Fully keyboard-navigable (arrow keys with year rollover at edges, Home/End, PageUp/PageDown for ± 1 year, Shift+PageUp/Down for ± 10 years), ARIA grid-compliant, and adapter-agnostic. Range selection keeps start and end strictly independent so selecting an end month does not implicitly set the start.

```tsx
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerTrigger,
  MonthYearSinglePanel,
} from "@salt-ds/date-components";

<DatePicker selectionVariant="single">
  <DatePickerTrigger>
    <DatePickerSingleInput format="MMMM YYYY" />
  </DatePickerTrigger>
  <DatePickerOverlay>
    <MonthYearSinglePanel />
  </DatePickerOverlay>
</DatePicker>;
```

```tsx
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerTrigger,
  MonthYearRangePanel,
} from "@salt-ds/date-components";

<DatePicker selectionVariant="range">
  <DatePickerTrigger>
    <DatePickerRangeInput format="MMMM YYYY" />
  </DatePickerTrigger>
  <DatePickerOverlay>
    <MonthYearRangePanel />
  </DatePickerOverlay>
</DatePicker>;
```
