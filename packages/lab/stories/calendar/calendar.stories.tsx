import {
  DateFormatter,
  DateValue,
  endOfMonth,
  getDayOfWeek,
  getLocalTimeZone,
  isSameDay,
  parseDate,
  startOfMonth,
  today,
} from "@internationalized/date";
import {
  Calendar,
  CalendarProps,
  UseRangeSelectionCalendarProps,
} from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { getHolidays } from "nyse-holidays";
import { useState } from "react";

import "./calendar.stories.css";

export default {
  title: "Lab/Calendar",
  component: Calendar,
  args: {
    selectionVariant: "default",
  },
} as Meta<typeof Calendar>;

const currentLocale = navigator.languages[0];
const localTimeZone = getLocalTimeZone();

const Template: StoryFn<typeof Calendar> = (args) => {
  return <Calendar {...args} />;
};

export const Default = Template.bind({});

export const UnselectableDates = Template.bind({});
UnselectableDates.args = {
  isDayUnselectable: (day) => {
    const nyseHolidays = getHolidays(day.year);
    // Saturday & Sunday
    if (getDayOfWeek(day, currentLocale) >= 5) {
      return {
        emphasis: "low",
      };
    }

    const holiday = nyseHolidays.find((h) =>
      isSameDay(parseDate(h.dateString), day)
    );
    if (holiday) {
      return {
        emphasis: "medium",
        tooltip: `This is a NYSE Holiday (${holiday.name})`,
      };
    }
  },
};

function renderDayContents(day: DateValue) {
  const formatter = new DateFormatter(currentLocale, { day: "2-digit" });
  return <>{formatter.format(day.toDate(localTimeZone))}</>;
}

export const CustomDayRender = Template.bind({});
CustomDayRender.args = {
  className: "CustomDayRender",
  renderDayContents,
};

console.log(today(localTimeZone));

export const FadeMonthAnimation = Template.bind({});
FadeMonthAnimation.args = {
  className: "FadeMonthAnimation",
};

export const NavigationBlocked = Template.bind({});

NavigationBlocked.args = {
  minDate: startOfMonth(today(localTimeZone)),
  maxDate: endOfMonth(today(localTimeZone)),
};

export const RangeSelection = Template.bind({});
RangeSelection.args = {
  selectionVariant: "range",
};

export const OffsetSelection = Template.bind({});
OffsetSelection.args = {
  selectionVariant: "offset",
  endDateOffset: (date) => date.add({ days: 4 }),
};

export const MultiSelection = Template.bind({});
MultiSelection.args = {
  selectionVariant: "multiselect",
};

export const HideOutOfRangeDays = Template.bind({});
HideOutOfRangeDays.args = {
  hideOutOfRangeDates: true,
};

export const TwinCalendars: StoryFn<typeof Calendar> = () => {
  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);
  const handleHoveredDateChange: CalendarProps["onHoveredDateChange"] = (
    event,
    newHoveredDate
  ) => {
    setHoveredDate(newHoveredDate);
  };
  const [selectedDate, setSelectedDate] =
    useState<UseRangeSelectionCalendarProps["selectedDate"]>(null);
  const handleSelectedDateChange: UseRangeSelectionCalendarProps["onSelectedDateChange"] =
    (event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Calendar
        selectionVariant="range"
        onHoveredDateChange={handleHoveredDateChange}
        hoveredDate={hoveredDate}
        onSelectedDateChange={handleSelectedDateChange}
        selectedDate={selectedDate}
      />
      <Calendar
        selectionVariant="range"
        onHoveredDateChange={handleHoveredDateChange}
        hoveredDate={hoveredDate}
        onSelectedDateChange={handleSelectedDateChange}
        selectedDate={selectedDate}
        defaultVisibleMonth={today(localTimeZone).add({ months: 1 })}
      />
    </div>
  );
};
