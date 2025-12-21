import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type CalendarRangeProps,
  useLocalization,
} from "@salt-ds/lab";
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";

export const TwinCalendars = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const today = dateAdapter.today();
  const [hoveredDate, setHoveredDate] = useState<DateFrameworkType | null>(
    null,
  );
  const handleHoveredDateChange: CalendarRangeProps["onHoveredDateChange"] = (
    _event,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
  };
  const [startVisibleMonth, setStartVisibleMonth] = useState<
    CalendarRangeProps["defaultVisibleMonth"]
  >(dateAdapter.startOf(today, "month"));
  const [endVisibleMonth, setEndVisibleMonth] = useState<
    CalendarRangeProps["defaultVisibleMonth"]
  >(dateAdapter.add(startVisibleMonth ?? today, { months: 1 }));
  const [focusedDate, setFocusedDate] = useState<DateFrameworkType | null>(
    startVisibleMonth ? dateAdapter.startOf(startVisibleMonth, "month") : null,
  );

  const handleStartVisibleMonthChange = useCallback(
    (
      _event: SyntheticEvent | null,
      newVisibleMonth: CalendarRangeProps["defaultVisibleMonth"],
    ) => {
      setStartVisibleMonth(newVisibleMonth);
      if (
        newVisibleMonth &&
        endVisibleMonth &&
        dateAdapter.compare(newVisibleMonth, endVisibleMonth) >= 0
      ) {
        setEndVisibleMonth(dateAdapter.add(newVisibleMonth, { months: 1 }));
      }
    },
    [dateAdapter, endVisibleMonth],
  );

  const handleEndVisibleMonthChange = useCallback(
    (
      _event: SyntheticEvent | null,
      newVisibleMonth: CalendarRangeProps["defaultVisibleMonth"],
    ) => {
      setEndVisibleMonth(newVisibleMonth);
      if (
        newVisibleMonth &&
        startVisibleMonth &&
        dateAdapter.compare(newVisibleMonth, startVisibleMonth) <= 0
      ) {
        setStartVisibleMonth(
          dateAdapter.startOf(
            dateAdapter.subtract(newVisibleMonth, { months: 1 }),
            "month",
          ),
        );
      }
    },
    [dateAdapter, startVisibleMonth],
  );

  const [selectedDate, setSelectedDate] = useState<
    CalendarRangeProps["selectedDate"]
  >({ startDate: undefined, endDate: undefined });

  const handleSelectionChange: CalendarRangeProps["onSelectionChange"] = (
    _event,
    newSelectedDate,
  ) => {
    setSelectedDate(newSelectedDate);
  };

  const handleFocusedDateChange: CalendarRangeProps["onFocusedDateChange"] = (
    _event,
    newFocusedDate,
  ) => {
    setFocusedDate(newFocusedDate);
  };

  return (
    <div
      role="region"
      aria-label="Twin Calendar example"
      style={{ display: "flex", gap: 16 }}
    >
      {/* biome-ignore lint/a11y/useValidAriaRole: composed calendar component does not need the role set */}
      <Calendar
        selectionVariant="range"
        focusedDate={
          focusedDate &&
          endVisibleMonth &&
          dateAdapter.compare(
            focusedDate,
            dateAdapter.startOf(endVisibleMonth, "month"),
          ) < 0
            ? focusedDate
            : null
        }
        hideOutOfRangeDates
        hoveredDate={hoveredDate}
        visibleMonth={startVisibleMonth}
        selectedDate={selectedDate}
        onFocusedDateChange={handleFocusedDateChange}
        onHoveredDateChange={handleHoveredDateChange}
        onVisibleMonthChange={handleStartVisibleMonthChange}
        onSelectionChange={handleSelectionChange}
        role={undefined}
      >
        <CalendarNavigation
          MonthDropdownProps={{
            "aria-label": "Select month first calendar",
          }}
          PreviousButtonProps={{
            "aria-label": "Previous month first calendar",
          }}
          NextButtonProps={{ "aria-label": "Next month first calendar" }}
          YearDropdownProps={{
            "aria-label": "Select year first calendar",
          }}
        />
        <CalendarGrid />
      </Calendar>
      {/* biome-ignore lint/a11y/useValidAriaRole: composed calendar component does not need the role set */}
      <Calendar
        selectionVariant="range"
        focusedDate={
          focusedDate &&
          endVisibleMonth &&
          dateAdapter.compare(
            focusedDate,
            dateAdapter.startOf(endVisibleMonth, "month"),
          ) >= 0
            ? focusedDate
            : null
        }
        hideOutOfRangeDates
        hoveredDate={hoveredDate}
        selectedDate={selectedDate}
        visibleMonth={endVisibleMonth}
        onFocusedDateChange={handleFocusedDateChange}
        onHoveredDateChange={handleHoveredDateChange}
        onVisibleMonthChange={handleEndVisibleMonthChange}
        onSelectionChange={handleSelectionChange}
        role={undefined}
      >
        <CalendarNavigation
          MonthDropdownProps={{
            "aria-label": "Select month second calendar",
          }}
          PreviousButtonProps={{
            "aria-label": "Previous month second calendar",
          }}
          NextButtonProps={{ "aria-label": "Next month second calendar" }}
          YearDropdownProps={{
            "aria-label": "Select year second calendar",
          }}
        />
        <CalendarGrid />
      </Calendar>
    </div>
  );
};
