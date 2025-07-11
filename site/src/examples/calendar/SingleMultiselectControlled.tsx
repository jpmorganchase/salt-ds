import { StackLayout } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";

import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type CalendarSingleProps,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

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

export const SingleMultiselectControlled = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const initialVisibleMonth = dateAdapter.parse(
    "01/01/2024",
    "DD/MM/YYYY",
  ).date;
  const initialSelectedDate = [
    "02/01/2024",
    "03/01/2024",
    "04/01/2024",
    "05/01/2024",
    "06/01/2024",
    "11/01/2024",
    "18/01/2024",
    "22/01/2024",
    "25/01/2024",
    "30/01/2024",
    "31/01/2024",
    "01/02/2024",
    "02/02/2024",
    "03/02/2024",
    "08/02/2024",
    "10/02/2024",
    "15/02/2024",
    "16/02/2024",
    "17/02/2024",
    "22/02/2024",
    "29/02/2024",
    "04/03/2024",
    "05/03/2024",
    "06/03/2024",
    "07/03/2024",
    "08/03/2024",
    "11/03/2024",
    "13/03/2024",
    "15/03/2024",
    "18/03/2024",
    "20/03/2024",
    "22/03/2024",
    "25/03/2024",
    "29/03/2024",
  ].map((date) => dateAdapter.parse(date, "DD/MM/YYYY").date);

  const [visibleMonth, setVisibleMonth] =
    useState<CalendarSingleProps<DateFrameworkType>["visibleMonth"][]>(
      initialVisibleMonth,
    );
  const [selectedDate, setSelectedDate] =
    useState<CalendarSingleProps<DateFrameworkType>["selectedDate"][]>(
      initialSelectedDate,
    );
  const handleSelectionChange: CalendarSingleProps<DateFrameworkType>["onSelectionChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };
  const handleVisibleMonthChange: CalendarSingleProps<DateFrameworkType>["onVisibleMonthChange"] =
    (_event, newVisibleMonth) => {
      setVisibleMonth(newVisibleMonth);
    };

  return (
    <Calendar
      selectionVariant={"single"}
      multiselect={true}
      visibleMonth={visibleMonth}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
      onVisibleMonthChange={handleVisibleMonthChange}
      hideOutOfRangeDates
      select={(
        previousSelectedDate: SingleDateSelection<DateFrameworkType>[],
        newDate: SingleDateSelection<DateFrameworkType>,
      ) => selectMultiselectSingle(dateAdapter, previousSelectedDate, newDate)}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};
