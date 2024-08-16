import {
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
  type CalendarProps, CalendarRangeProps, CalendarSingleProps,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

import "./calendar.stories.css";
import clsx from "clsx";

export default {
  title: "Lab/Calendar",
  component: Calendar,
  args: {
    selectionVariant: "single",
  },
} as Meta<typeof Calendar>;

const currentLocale = navigator.languages[0];
const localTimeZone = getLocalTimeZone();

const Template: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation />
    </Calendar>
  );
};

export const Single = Template.bind({
  selectionVariant: "single",
});

export const Range = Template.bind({});
Range.args = {
  selectionVariant: "range",
};

export const Multiselect = Template.bind({});
Multiselect.args = {
  selectionVariant: "multiselect",
};

export const OffsetSelection = Template.bind({});
OffsetSelection.args = {
  selectionVariant: "offset",
  endDateOffset: (date) => date.add({ days: 4 }),
};

export const UnselectableDates = Template.bind({});
UnselectableDates.args = {
  isDayUnselectable: (day) => {
    // Saturday & Sunday
    if (getDayOfWeek(day, currentLocale) >= 5) {
      return "weekend";
    }
  },
};

export const DisabledDates = Template.bind({});
DisabledDates.args = {
  isDayDisabled: (day) => getDayOfWeek(day, currentLocale) >= 5,
};

export const HighlightedDates = Template.bind({});
HighlightedDates.args = {
  isDayHighlighted: (day) => {
    // Start of month
    if (isEqualDay(startOfMonth(day), day)) {
      return "Start of month reminder";
    }
  },
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

export const CustomHeader: StoryFn<CalendarSingleProps & React.RefAttributes<HTMLDivElement>> = (args) => {
  const [selectedDate, setSelectedDate] = useState<
    UseCalendarSelectionSingleProps["selectedDate"]
  >(today(getLocalTimeZone()).subtract({ years: 1 }));
  return (
    <Calendar
      {...args}
      selectionVariant="single"
      selectedDate={selectedDate}
      visibleMonth={selectedDate ? startOfMonth(selectedDate) : startOfMonth(today(getLocalTimeZone()))}
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
  const formatter = new DateFormatter(currentLocale, { day: "2-digit" });
  return <>{formatter.format(day.toDate(localTimeZone))}</>;
}

export const CustomDayRender: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args} className="CustomDayRender" renderDayContents={renderDayContents}/>
  );
};

export const FadeMonthAnimation = Template.bind({});
FadeMonthAnimation.args = {
  className: "FadeMonthAnimation",
};

export const MinMaxDates = Template.bind({});
MinMaxDates.args = {
  minDate: startOfMonth(today(localTimeZone)),
  maxDate: endOfMonth(today(localTimeZone)),
};

export const ExpandedYears = Template.bind({});

ExpandedYears.args = {
  minDate: startOfYear(today(getLocalTimeZone()).subtract({ years: 5 })),
  maxDate: startOfYear(today(getLocalTimeZone()).add({ years: 5 })),
};

export const TwinCalendars: StoryFn<CalendarRangeProps & React.RefAttributes<HTMLDivElement>> = (args) => {
  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);
  const handleHoveredDateChange: CalendarProps["onHoveredDateChange"] = (
    _event,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
  };
  const [selectedDate, setSelectedDate] =
    useState<UseCalendarSelectionRangeProps["selectedDate"]>(args.defaultSelectedDate || null);
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
        defaultVisibleMonth={selectedDate?.startDate ? startOfMonth(selectedDate.startDate) : startOfMonth(today(getLocalTimeZone()))}
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
        defaultVisibleMonth={selectedDate?.endDate ? startOfMonth(selectedDate.endDate) : startOfMonth(today(getLocalTimeZone()).add({ months: 1}))}
        hideOutOfRangeDates
      >
        <CalendarNavigation />
      </Calendar>
    </div>
  );
};

export const WithLocaleES: StoryFn<typeof Calendar> = (args) => (
  <Calendar {...args} locale="es-ES">
    <CalendarNavigation />
  </Calendar>
);
