import { StackLayout } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  type CalendarMultiselectOffsetProps,
  CalendarNavigation,
  type CalendarOffsetProps,
  type DateRangeSelection,
  useLocalization,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

function selectMultiselectOffset(
  dateAdapter: SaltDateAdapter<DateFrameworkType>,
  previousSelectedDate: DateRangeSelection<DateFrameworkType>[],
  newDate: DateFrameworkType,
  endDateOffset: CalendarOffsetProps["endDateOffset"],
): DateRangeSelection<DateFrameworkType>[] {
  if (previousSelectedDate.length === 0) {
    return [{ startDate: newDate, endDate: endDateOffset?.(newDate) }];
  }

  const newSelection = previousSelectedDate.filter((previousOffset) => {
    return !(
      previousOffset?.startDate &&
      dateAdapter.compare(newDate, previousOffset?.startDate) >= 0 &&
      previousOffset?.endDate &&
      dateAdapter.compare(newDate, previousOffset?.endDate) <= 0
    );
  });
  if (previousSelectedDate.length !== newSelection.length) {
    return newSelection;
  }
  return [
    ...previousSelectedDate,
    { startDate: newDate, endDate: endDateOffset?.(newDate) },
  ];
}

export const OffsetMultiselectControlled = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const endDateOffset = (date: ReturnType<typeof dateAdapter.date>) =>
    dateAdapter.add(date, { days: 4 });
  const [selectedDate, setSelectedDate] = useState<
    CalendarMultiselectOffsetProps["selectedDate"]
  >([
    {
      startDate: dateAdapter.today(),
      endDate: endDateOffset(dateAdapter.today()),
    },
  ]);
  const handleSelectionChange: CalendarMultiselectOffsetProps["onSelectionChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };

  return (
    <Calendar
      selectionVariant={"offset"}
      endDateOffset={endDateOffset}
      multiselect={true}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
      select={(
        previousSelectedDate: DateRangeSelection<DateFrameworkType>[],
        newDate: DateFrameworkType,
      ) => {
        return selectMultiselectOffset(
          dateAdapter,
          previousSelectedDate,
          newDate,
          endDateOffset,
        );
      }}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};
