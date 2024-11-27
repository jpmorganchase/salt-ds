import { Button, Divider, StackLayout } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  type UseCalendarSelectionSingleProps,
  useLocalization,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const TodayButton = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const today = dateAdapter.today();
  const [selectedDate, setSelectedDate] =
    useState<
      UseCalendarSelectionSingleProps<DateFrameworkType>["selectedDate"]
    >(null);
  return (
    <Calendar
      selectionVariant="single"
      selectedDate={selectedDate}
      defaultVisibleMonth={dateAdapter.startOf(today, "month")}
      onSelectionChange={(_event, newSelectedDate) =>
        setSelectedDate(newSelectedDate)
      }
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
        <Divider />
        <Button
          style={{ margin: "var(--salt-spacing-50)" }}
          sentiment="accented"
          appearance="bordered"
          onClick={() => setSelectedDate(today)}
        >
          Today
        </Button>
      </StackLayout>
    </Calendar>
  );
};
