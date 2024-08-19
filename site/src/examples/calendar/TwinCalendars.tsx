import {
  type DateValue,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";
import {
  Calendar,
  CalendarNavigation,
  type CalendarProps,
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
  const handleSelectedDateChange: UseCalendarSelectionRangeProps["onSelectedDateChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Calendar
        selectionVariant="range"
        onHoveredDateChange={handleHoveredDateChange}
        hoveredDate={hoveredDate}
        onSelectedDateChange={handleSelectedDateChange}
        defaultVisibleMonth={
          selectedDate?.startDate
            ? startOfMonth(selectedDate.startDate)
            : startOfMonth(today(getLocalTimeZone()))
        }
        selectedDate={selectedDate}
        hideOutOfRangeDates
      >
        <CalendarNavigation />
      </Calendar>
      <Calendar
        selectionVariant="range"
        onHoveredDateChange={handleHoveredDateChange}
        hoveredDate={hoveredDate}
        onSelectedDateChange={handleSelectedDateChange}
        selectedDate={selectedDate}
        defaultVisibleMonth={
          selectedDate?.endDate
            ? startOfMonth(selectedDate.endDate)
            : startOfMonth(today(getLocalTimeZone()).add({ months: 1 }))
        }
        hideOutOfRangeDates
      >
        <CalendarNavigation />
      </Calendar>
    </div>
  );
};
