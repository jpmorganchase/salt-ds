import { useState } from "react";
import { Calendar, CalendarProps } from "@jpmorganchase/uitk-lab";
import {
  getDayOfWeek,
  getLocalTimeZone,
  today,
  DateFormatter,
  DateValue,
} from "@internationalized/date";

import { ComponentStory, ComponentMeta } from "@storybook/react";

import "./calendar.stories.css";
import { UseRangeSelectionCalendarProps } from "@jpmorganchase/uitk-lab/src/calendar/internal/useSelection";

export default {
  title: "Lab/Calendar",
  component: Calendar,
  args: {
    selectionVariant: "default",
  },
} as ComponentMeta<typeof Calendar>;

const currentLocale = navigator.languages[0];
const localTimeZone = getLocalTimeZone();

const Template: ComponentStory<typeof Calendar> = (args) => {
  return <Calendar {...args} />;
};

export const DefaultCalendar = Template.bind({});

export const UnselectableHighEmphasisDates = Template.bind({});
UnselectableHighEmphasisDates.args = {
  isDayUnselectable: (day) =>
    today(localTimeZone).compare(day) > 0
      ? { emphasis: "high", tooltip: "Date is in the past." }
      : false,
};

export const UnselectableLowEmphasisDates = Template.bind({});
UnselectableLowEmphasisDates.args = {
  isDayUnselectable: (day) => getDayOfWeek(day, currentLocale) >= 5,
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

export const FadeMonthAnimation = Template.bind({});
FadeMonthAnimation.args = {
  className: "FadeMonthAnimation",
};

export const NavigationBlocked = Template.bind({});

NavigationBlocked.args = {
  minDate: today(localTimeZone).subtract({ months: 2 }),
  maxDate: today(localTimeZone).add({ months: 2 }),
};

export const RangeSelection = Template.bind({});
RangeSelection.args = {
  selectionVariant: "range",
};

export const OffsetSelection = Template.bind({});
OffsetSelection.args = {
  selectionVariant: "offset",
  startDateOffset: (date) => date.subtract({ days: 2 }),
  endDateOffset: (date) => date.add({ days: 2 }),
};

export const MultiSelection = Template.bind({});
MultiSelection.args = {
  selectionVariant: "multiselect",
};

export const HideOutOfRangeDays = Template.bind({});
HideOutOfRangeDays.args = {
  hideOutOfRangeDates: true,
};

export const TwinCalendars: ComponentStory<typeof Calendar> = () => {
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
    <div style={{ display: "flex" }}>
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
      />
    </div>
  );
};
