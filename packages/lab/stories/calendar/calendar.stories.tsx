import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  endOfMonth,
  getDayOfWeek,
  getLocalTimeZone,
  isEqualDay,
  startOfMonth,
  startOfYear,
  today,
} from "@internationalized/date";
import { Button, StackLayout } from "@salt-ds/core";
import {
  Calendar,
  CalendarNavigation,
  type CalendarProps,
  type CalendarRangeProps,
  type CalendarSingleProps,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
  getCurrentLocale,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type React from "react";
import { useState } from "react";

import "./calendar.stories.css";

export default {
  title: "Lab/Calendar",
  component: Calendar,
  args: {
    selectionVariant: "single",
    children: <CalendarNavigation />,
  },
} as Meta<typeof Calendar>;

const Template: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation />
    </Calendar>
  );
};

export const Single = Template.bind({
  selectionVariant: "single",
  defaultSelectedDate: today(getLocalTimeZone()),
});

export const Range = Template.bind({});
Range.args = {
  selectionVariant: "range",
  defaultSelectedDate: {
    startDate: today(getLocalTimeZone()).subtract({ days: 10 }),
    endDate: today(getLocalTimeZone()),
  },
};

export const Multiselect = Template.bind({});
Multiselect.args = {
  selectionVariant: "multiselect",
  hideOutOfRangeDates: true,
  defaultVisibleMonth: new CalendarDate(2024, 1, 1),
  defaultSelectedDate: [
    new CalendarDate(2024, 1, 2),
    new CalendarDate(2024, 1, 3),
    new CalendarDate(2024, 1, 4),
    new CalendarDate(2024, 1, 5),
    new CalendarDate(2024, 1, 6),
    new CalendarDate(2024, 1, 11),
    new CalendarDate(2024, 1, 18),
    new CalendarDate(2024, 1, 22),
    new CalendarDate(2024, 1, 25),
    new CalendarDate(2024, 1, 30),
    new CalendarDate(2024, 1, 31),
    new CalendarDate(2024, 2, 1),
    new CalendarDate(2024, 2, 2),
    new CalendarDate(2024, 2, 3),
    new CalendarDate(2024, 2, 4),
    new CalendarDate(2024, 2, 8),
    new CalendarDate(2024, 2, 11),
    new CalendarDate(2024, 2, 15),
    new CalendarDate(2024, 2, 16),
    new CalendarDate(2024, 2, 17),
    new CalendarDate(2024, 2, 18),
    new CalendarDate(2024, 2, 22),
    new CalendarDate(2024, 2, 29),
    new CalendarDate(2024, 3, 6),
    new CalendarDate(2024, 3, 7),
    new CalendarDate(2024, 3, 8),
    new CalendarDate(2024, 3, 9),
    new CalendarDate(2024, 3, 10),
    new CalendarDate(2024, 3, 13),
    new CalendarDate(2024, 3, 15),
    new CalendarDate(2024, 3, 17),
    new CalendarDate(2024, 3, 20),
    new CalendarDate(2024, 3, 22),
    new CalendarDate(2024, 3, 24),
    new CalendarDate(2024, 3, 27),
    new CalendarDate(2024, 3, 31),
  ],
};

export const Offset = Template.bind({});
Offset.args = {
  selectionVariant: "offset",
  endDateOffset: (date) => date.add({ days: 2 }),
  defaultSelectedDate: {
    startDate: today(getLocalTimeZone()).subtract({ days: 2 }),
    endDate: today(getLocalTimeZone()),
  },
};

export const UnselectableDates = Template.bind({});
UnselectableDates.args = {
  // Saturday & Sunday
  isDayUnselectable: (date) =>
    getDayOfWeek(date, getCurrentLocale()) >= 5
      ? "Weekends are un-selectable"
      : false,
};

export const DisabledDates = Template.bind({});
DisabledDates.args = {
  // Saturday & Sunday
  isDayDisabled: (date) =>
    getDayOfWeek(date, getCurrentLocale()) >= 5
      ? "Weekends are disabled"
      : false,
};

export const HighlightedDates = Template.bind({});
HighlightedDates.args = {
  // Start of month
  isDayHighlighted: (day) =>
    isEqualDay(startOfMonth(day), day) ? "Start of month reminder" : false,
};

export const HideOutOfRangeDates = Template.bind({});
HideOutOfRangeDates.args = {
  hideOutOfRangeDates: true,
};

export const HideYearDropdown: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation hideYearDropdown />
    </Calendar>
  );
};

export const CustomHeader: StoryFn<
  CalendarSingleProps & React.RefAttributes<HTMLDivElement>
> = (args) => {
  const [selectedDate, setSelectedDate] = useState<
    UseCalendarSelectionSingleProps["selectedDate"]
  >(today(getLocalTimeZone()).subtract({ years: 1 }));
  return (
    <Calendar
      {...args}
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

function renderDayContents(day: DateValue) {
  const formatter = new DateFormatter(getCurrentLocale(), { day: "2-digit" });
  return <>{formatter.format(day.toDate(getLocalTimeZone()))}</>;
}

export const CustomDayRender: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar
      {...args}
      className="CustomDayRender"
      renderDayContents={renderDayContents}
    />
  );
};

export const FadeMonthAnimation = Template.bind({});
FadeMonthAnimation.args = {
  className: "FadeMonthAnimation",
};

export const MinMaxDate = Template.bind({});
MinMaxDate.args = {
  minDate: startOfMonth(today(getLocalTimeZone())),
  maxDate: endOfMonth(today(getLocalTimeZone())),
};

export const ExpandedYears = Template.bind({});

ExpandedYears.args = {
  minDate: startOfYear(today(getLocalTimeZone()).subtract({ years: 5 })),
  maxDate: startOfYear(today(getLocalTimeZone()).add({ years: 5 })),
};

export const TwinCalendars: StoryFn<
  CalendarRangeProps & React.RefAttributes<HTMLDivElement>
> = (args) => {
  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);
  const handleHoveredDateChange: CalendarProps["onHoveredDateChange"] = (
    _event,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
  };
  const [selectedDate, setSelectedDate] = useState<
    UseCalendarSelectionRangeProps["selectedDate"]
  >(args.defaultSelectedDate || null);
  const handleSelectedDateChange: UseCalendarSelectionRangeProps["onSelectedDateChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Calendar
        {...args}
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
        {...args}
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

export const WithLocale: StoryFn<typeof Calendar> = (args) => (
  <Calendar {...args} locale="es-ES">
    <CalendarNavigation />
  </Calendar>
);

export const Bordered: StoryFn<typeof Calendar> = (args) => (
  <Calendar {...args}>
    <CalendarNavigation
      MonthDropdownProps={{ bordered: true }}
      YearDropdownProps={{ bordered: true }}
    />
  </Calendar>
);
