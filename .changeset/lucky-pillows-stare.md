---
"@salt-ds/lab": patch
---

Updated the `Calendar` API to use a `multiselect` prop instead of `selectionVariant="multiselect"`

Previously, the `Calendar` component used `selectionVariant="multiselect"` to enable the selection and de-selection of multiple single dates, with the de-selection logic embedded within the component.

To extend multiple selection capabilities to all selection variants, we have revised the API to include a `multiselect` boolean prop. This change removes the need for `selectionVariant="multiselect"`.

Now, you can apply the multiselect property in `Calendar` alongside `selectionVariant="single`", `selectionVariant="range"`, or `selectionVariant="offset"`.

This update allows us to offer a consistent multiple selection API across all date selection variants.

```diff
<Calendar
-  selectionVariant="multiselect"
+  selectionVariant="single"
+  multiselect
>
  <CalendarNavigation />
  <CalendarGrid />
</Calendar>
```

To de-select a previous selection, control is provided through a new `select` prop that enables control over the current selection based on the day that has been selected by the user.

```diff
function selectMultiselectSingle<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  previousSelectedDate: SingleDateSelection<TDate>[],
  newDate: TDate,
) {
  const newSelection = previousSelectedDate.filter(
    (previousSingleDate) =>
      !dateAdapter.isSame(previousSingleDate, newDate, "day"),
  );
  if (previousSelectedDate.length !== newSelection.length) {
    return newSelection;
  }
  return [...previousSelectedDate, newDate];
}

<Calendar
-  selectionVariant="multiselect"
+  selectionVariant="single"
+  multiselect
+   select={(
+     previousSelectedDate: SingleDateSelection<DateFrameworkType>[],
+     newDate: SingleDateSelection<DateFrameworkType>,
+   ) => selectMultiselectSingle(dateAdapter, previousSelectedDate, newDate)}
   >
   <StackLayout gap={0}>
      <CalendarNavigation />
      <CalendarGrid />
   </StackLayout>
</Calendar>
```

A few additional type changes have occurred:

`CalendarMultiSelectProps` has been replaced by `CalendarMultiselectSingleProps`, and `UseCalendarMultiSelectProps` has been replaced by `UseCalendarMultiselectSingleProps`.

```diff
- import { type CalendarMultiSelectProps } from "@salt-ds/lab";
+ import { type CalendarMultiselectSingleProps } from "@salt-ds/lab";

- import { type UseCalendarMultiSelectProps } from "@salt-ds/lab";
+ import { type UseCalendarMultiselectSingleProps } from "@salt-ds/lab";
```

The associated selected date type for multiselect single dates, has also been updated:

```diff
import type { DateFrameworkType } from "@salt-ds/date-adapters"; // This type can be any supported date framework object type, such as Date, Dayjs, Luxon, or Moment
- import type { MultipleDateSelection } from "@salt-ds/lab";
+ import type { SingleDateSelection } from "@salt-ds/lab";
- type selectedDate = MultipleDateSelection<DateFrameworkType>;
+ type selectedDate = Array<SingleDateSelection<DateFrameworkType>>;
```

Our goal for the `DatePicker` is to support multiple selection across all date types: `single`, `range`, and `offset`, similar to the functionality in Calendar.
However, this will require a design iteration around the input component before it can be added.
