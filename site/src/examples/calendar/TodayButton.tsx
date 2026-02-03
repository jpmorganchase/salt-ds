import { Button, Divider, StackLayout } from "@salt-ds/core";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type UseCalendarSelectionSingleProps,
  useLocalization,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const TodayButton = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const today = dateAdapter.today();
  const [selectedDate, setSelectedDate] =
    useState<UseCalendarSelectionSingleProps["selectedDate"]>(null);
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
        <CalendarGrid />
        <Divider />
        <Button
          aria-label={`Change Date, ${dateAdapter.format(today, "dddd DD MMMM YYYY")}`}
          style={{ margin: "var(--salt-spacing-100)" }}
          sentiment="accented"
          appearance="solid"
          onClick={() => setSelectedDate(today)}
        >
          Today
        </Button>
      </StackLayout>
    </Calendar>
  );
};
