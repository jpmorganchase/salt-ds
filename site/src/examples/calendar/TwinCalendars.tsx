import {
  type DateValue,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type CalendarProps,
  CalendarWeekHeader,
  type UseCalendarSelectionRangeProps,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const TwinCalendars = (): ReactElement => {
  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);
  const handleHoveredDateChange: CalendarProps["onHoveredDateChange"] = (
    _event,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
  };
  const [selectedDate, setSelectedDate] =
    useState<UseCalendarSelectionRangeProps["selectedDate"]>(null);
  const handleSelectionChange: UseCalendarSelectionRangeProps["onSelectionChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Calendar
        selectionVariant="range"
        onHoveredDateChange={handleHoveredDateChange}
        hoveredDate={hoveredDate}
        onSelectionChange={handleSelectionChange}
        defaultVisibleMonth={
          selectedDate?.startDate
            ? startOfMonth(selectedDate.startDate)
            : startOfMonth(today(getLocalTimeZone()))
        }
        selectedDate={selectedDate}
      >
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="range"
        onHoveredDateChange={handleHoveredDateChange}
        hoveredDate={hoveredDate}
        onSelectionChange={handleSelectionChange}
        selectedDate={selectedDate}
        defaultVisibleMonth={
          selectedDate?.endDate
            ? startOfMonth(selectedDate.endDate)
            : startOfMonth(today(getLocalTimeZone()).add({ months: 1 }))
        }
      >
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </Calendar>
    </div>
  );
};
