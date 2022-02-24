import { useState } from "react";
import { Calendar, CalendarProps } from "@brandname/lab";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

import { ComponentStory, ComponentMeta } from "@storybook/react";

import "./calendar.stories.css";
import { UseRangeSelectionCalendarProps } from "@brandname/lab/src/calendar/internal/useSelection";

dayjs.extend(isoWeek);

export default {
  title: "Lab/Calendar",
  component: Calendar,
  args: {
    selectionVariant: "default",
  },
} as ComponentMeta<typeof Calendar>;

const Template: ComponentStory<typeof Calendar> = (args) => {
  return <Calendar {...args} />;
};

export const DefaultCalendar = Template.bind({});

export const UnselectableHighEmphasisDates = Template.bind({});
UnselectableHighEmphasisDates.args = {
  isDayUnselectable: (day) =>
    dayjs().diff(day) > 0
      ? { emphasis: "high", tooltip: "Date is in the past." }
      : false,
};

export const UnselectableLowEmphasisDates = Template.bind({});
UnselectableLowEmphasisDates.args = {
  isDayUnselectable: (day) => dayjs(day).isoWeekday() >= 6,
};

export const CustomFirstDayOfWeek = Template.bind({});
CustomFirstDayOfWeek.args = { firstDayOfWeek: 0 };

function renderDayContents(day: Date) {
  return <>{dayjs(day).format("ddd")}</>;
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
// Calling .add() with this inline breaks storybook - https://github.com/storybookjs/storybook/issues/12208
const dateRangeCount = 2;
NavigationBlocked.args = {
  minDate: dayjs().subtract(dateRangeCount, "month").toDate(),
  maxDate: dayjs().add(dateRangeCount, "month").toDate(),
};

export const RangeSelection = Template.bind({});
RangeSelection.args = {
  selectionVariant: "range",
};

export const OffsetSelection = Template.bind({});
OffsetSelection.args = {
  selectionVariant: "offset",
  startDateOffset: (date) =>
    dayjs(date).subtract(dateRangeCount, "days").toDate(),
  endDateOffset: (date) => dayjs(date).add(dateRangeCount, "days").toDate(),
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
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
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
