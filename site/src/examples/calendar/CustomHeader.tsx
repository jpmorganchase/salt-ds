import { getLocalTimeZone, startOfMonth, today } from "@internationalized/date";
import { Button, StackLayout } from "@salt-ds/core";
import {
  Calendar,
  CalendarNavigation,
  type UseCalendarSelectionSingleProps,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const CustomHeader = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<
    UseCalendarSelectionSingleProps["selectedDate"]
  >(today(getLocalTimeZone()).subtract({ years: 1 }));
  return (
    <Calendar
      selectionVariant="single"
      selectedDate={selectedDate}
      visibleMonth={
        selectedDate
          ? startOfMonth(selectedDate)
          : startOfMonth(today(getLocalTimeZone()))
      }
      onSelectedDateChange={(_event, newSelectedDate) =>
        setSelectedDate(newSelectedDate)
      }
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <Button onClick={() => setSelectedDate(today(getLocalTimeZone()))}>
          Today
        </Button>
      </StackLayout>
    </Calendar>
  );
};
