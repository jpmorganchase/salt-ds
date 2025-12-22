import { StackLayout } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  type CalendarMultiselectRangeProps,
  CalendarNavigation,
  type DateRangeSelection,
  useLocalization,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

function selectDateRange(
  dateAdapter: SaltDateAdapter,
  previousSelectedDate: DateRangeSelection,
  newDate: DateFrameworkType,
): DateRangeSelection {
  const isSelectedAlready =
    !!previousSelectedDate?.startDate && !!previousSelectedDate?.endDate;
  if (
    isSelectedAlready &&
    previousSelectedDate?.startDate &&
    dateAdapter.compare(newDate, previousSelectedDate.startDate) >= 0 &&
    previousSelectedDate?.endDate &&
    dateAdapter.compare(newDate, previousSelectedDate.endDate) <= 0
  ) {
    return { startDate: null, endDate: null };
  }
  if (previousSelectedDate?.startDate && previousSelectedDate?.endDate) {
    return {
      startDate: newDate,
    };
  }
  if (
    previousSelectedDate?.startDate &&
    dateAdapter.compare(newDate, previousSelectedDate?.startDate) >= 0
  ) {
    return {
      ...previousSelectedDate,
      endDate: newDate,
    };
  }
  return {
    startDate: newDate,
  };
}

function selectMultiselectRange(
  dateAdapter: SaltDateAdapter,
  previousSelectedDate: DateRangeSelection[],
  newDate: DateFrameworkType,
): DateRangeSelection[] {
  const lastRange = previousSelectedDate.length
    ? previousSelectedDate[previousSelectedDate.length - 1]
    : undefined;
  const isIncompleteRange = !lastRange?.endDate;

  if (isIncompleteRange) {
    const isNewSelection = previousSelectedDate.length === 0;
    if (isNewSelection) {
      return [{ startDate: newDate }];
    }
    const completeDateRange = selectDateRange(
      dateAdapter,
      previousSelectedDate[previousSelectedDate.length - 1],
      newDate,
    );
    return [
      ...previousSelectedDate.slice(0, -1),
      completeDateRange,
    ] as DateRangeSelection[];
  }

  const newSelection = previousSelectedDate.filter((previousDateRange) => {
    return !(
      previousDateRange?.startDate &&
      previousDateRange?.endDate &&
      dateAdapter.compare(newDate, previousDateRange?.startDate) >= 0 &&
      dateAdapter.compare(newDate, previousDateRange?.endDate) <= 0
    );
  });
  if (previousSelectedDate.length !== newSelection.length) {
    return newSelection;
  }
  return [...previousSelectedDate, { startDate: newDate }];
}

export const RangeMultiselectControlled = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<
    CalendarMultiselectRangeProps["selectedDate"]
  >([
    {
      startDate: dateAdapter.today(),
      endDate: dateAdapter.add(dateAdapter.today(), { days: 4 }),
    },
  ]);
  const handleSelectionChange: CalendarMultiselectRangeProps["onSelectionChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };

  return (
    <Calendar
      selectionVariant={"range"}
      multiselect={true}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
      select={(
        previousSelectedDate: DateRangeSelection[],
        newDate: DateFrameworkType,
      ) => selectMultiselectRange(dateAdapter, previousSelectedDate, newDate)}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};
