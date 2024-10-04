import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  endOfMonth,
  getDayOfWeek,
  getLocalTimeZone,
  isEqualDay,
  startOfMonth,
  today,
} from "@internationalized/date";
import { Button, Divider, StackLayout } from "@salt-ds/core";
import {
  Calendar,
  CalendarGrid,
  type CalendarMultiSelectProps,
  CalendarNavigation,
  type CalendarProps,
  type CalendarRangeProps,
  type CalendarSingleProps,
  CalendarWeekHeader,
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
    children: (
      <>
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </>
    ),
  },
} as Meta<typeof Calendar>;

const Template: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const Single = Template.bind({});
Single.args = {
  selectionVariant: "single",
  defaultSelectedDate: today(getLocalTimeZone()),
};

export const Range = Template.bind({});
Range.args = {
  selectionVariant: "range",
  defaultSelectedDate: {
    startDate: today(getLocalTimeZone()).subtract({ days: 10 }),
    endDate: today(getLocalTimeZone()),
  },
};

export const Multiselect: StoryFn<
  CalendarMultiSelectProps & React.RefAttributes<HTMLDivElement>
> = ({ selectionVariant, ...args }) => {
  return (
    <Calendar
      selectionVariant="multiselect"
      defaultVisibleMonth={new CalendarDate(2024, 1, 1)}
      defaultSelectedDate={[
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
      ]}
      hideOutOfRangeDates
      {...args}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const Offset = Template.bind({});
Offset.args = {
  selectionVariant: "offset",
  endDateOffset: (date) => date.add({ days: 2 }),
  defaultSelectedDate: {
    startDate: today(getLocalTimeZone()),
    endDate: today(getLocalTimeZone()).add({ days: 2 }),
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

export const HideOutOfRangeDates: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar hideOutOfRangeDates {...args}>
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const HideYearDropdown: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation hideYearDropdown />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const TodayButton: StoryFn<
  CalendarSingleProps & React.RefAttributes<HTMLDivElement>
> = ({ selectionVariant, ...args }) => {
  const [selectedDate, setSelectedDate] = useState<
    UseCalendarSelectionSingleProps["selectedDate"]
  >(today(getLocalTimeZone()).subtract({ years: 1 }));
  return (
    <Calendar
      selectionVariant={selectionVariant}
      selectedDate={selectedDate}
      visibleMonth={
        selectedDate
          ? startOfMonth(selectedDate)
          : startOfMonth(today(getLocalTimeZone()))
      }
      onSelectionChange={(_event, newSelectedDate) =>
        setSelectedDate(newSelectedDate)
      }
      {...args}
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
          onClick={() => setSelectedDate(today(getLocalTimeZone()))}
        >
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
    <Calendar {...args}>
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid
        getCalendarMonthProps={(date) => ({ renderDayContents })}
      />
    </Calendar>
  );
};

export const FadeMonthAnimation = Template.bind({});
FadeMonthAnimation.args = {
  className: "FadeMonthAnimation",
};

export const MinMaxDate = Template.bind({});
MinMaxDate.args = {
  defaultSelectedDate: today(getLocalTimeZone()),
  minDate: startOfMonth(today(getLocalTimeZone())),
  maxDate: endOfMonth(today(getLocalTimeZone())),
};

export const TwinCalendars: StoryFn<
  CalendarRangeProps & React.RefAttributes<HTMLDivElement>
> = ({ selectionVariant, ...args }) => {
  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);
  const handleHoveredDateChange: CalendarProps["onHoveredDateChange"] = (
    event,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
    args?.onHoveredDateChange?.(event, newHoveredDate);
  };
  const [selectedDate, setSelectedDate] = useState<
    UseCalendarSelectionRangeProps["selectedDate"]
  >(args.defaultSelectedDate || null);
  const handleSelectionChange: UseCalendarSelectionRangeProps["onSelectionChange"] =
    (event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
      args?.onSelectionChange?.(event, newSelectedDate);
    };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Calendar
        selectionVariant="range"
        hideOutOfRangeDates
        hoveredDate={hoveredDate}
        defaultVisibleMonth={
          selectedDate?.startDate
            ? startOfMonth(selectedDate.startDate)
            : startOfMonth(today(getLocalTimeZone()))
        }
        selectedDate={selectedDate}
        {...args}
        onHoveredDateChange={handleHoveredDateChange}
        onSelectionChange={handleSelectionChange}
      >
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="range"
        hideOutOfRangeDates
        hoveredDate={hoveredDate}
        selectedDate={selectedDate}
        defaultVisibleMonth={
          selectedDate?.endDate
            ? startOfMonth(selectedDate.endDate)
            : startOfMonth(today(getLocalTimeZone()).add({ months: 1 }))
        }
        {...args}
        onHoveredDateChange={handleHoveredDateChange}
        onSelectionChange={handleSelectionChange}
      >
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </Calendar>
    </div>
  );
};

export const WithLocale: StoryFn<typeof Calendar> = (args) => (
  <Calendar {...args} locale="es-ES">
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);

export const Bordered: StoryFn<typeof Calendar> = (args) => (
  <Calendar {...args}>
    <CalendarNavigation
      MonthDropdownProps={{ bordered: true }}
      YearDropdownProps={{ bordered: true }}
    />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);
