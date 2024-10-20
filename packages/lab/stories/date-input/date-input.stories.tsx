import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  DateInputRange,
  type DateInputRangeError,
  type DateInputRangeProps,
  DateInputSingle,
  type DateInputSingleError,
  type DateInputSingleProps,
  type DateRangeSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "@storybook/test";
import type { SyntheticEvent } from "react";

export default {
  title: "Lab/Date Input",
  component: DateInputSingle,
} as Meta<typeof DateInputSingle>;

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate
    ? formatDate(startDate, locale)
    : startDate;
  const formattedEndDate = endDate ? formatDate(endDate, locale) : endDate;
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

const DateInputSingleTemplate: StoryFn<DateInputSingleProps> = (args) => {
  const handleDateChange = (
    event: SyntheticEvent,
    newSelectedDate: DateValue | null,
    error: DateInputSingleError,
  ) => {
    console.log(
      `Selected date: ${newSelectedDate ? formatDate(newSelectedDate) : newSelectedDate}`,
    );
    args?.onDateChange?.(event, newSelectedDate, error);
  };
  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle {...args} onDateChange={handleDateChange} />
    </div>
  );
};

const DateInputRangeTemplate: StoryFn<DateInputRangeProps> = (args) => {
  const handleDateChange = (
    event: SyntheticEvent,
    newSelectedDate: DateRangeSelection | null,
    error: DateInputRangeError,
  ) => {
    console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
    args?.onDateChange?.(event, newSelectedDate, error);
  };
  return (
    <div style={{ width: "250px" }}>
      <DateInputRange {...args} onDateChange={handleDateChange} />
    </div>
  );
};

export const Single = DateInputSingleTemplate.bind({});
Single.args = {
  defaultDate: today(getLocalTimeZone()),
  onDateValueChange: fn(),
};

export const Range = DateInputRangeTemplate.bind({});
Range.args = {
  defaultDate: {
    startDate: today(getLocalTimeZone()),
    endDate: today(getLocalTimeZone()).add({ days: 7 }),
  },
  onDateValueChange: fn(),
};

export const SingleBordered = DateInputSingleTemplate.bind({});
SingleBordered.args = {
  bordered: true,
  defaultDate: today(getLocalTimeZone()),
  onDateValueChange: fn(),
};

export const RangeBordered = DateInputRangeTemplate.bind({});
RangeBordered.args = {
  bordered: true,
  defaultDate: {
    startDate: today(getLocalTimeZone()),
    endDate: today(getLocalTimeZone()).add({ days: 7 }),
  },
  onDateValueChange: fn(),
};

export const EmptyReadOnlyMarker = DateInputSingleTemplate.bind({});
EmptyReadOnlyMarker.args = {
  emptyReadOnlyMarker: "-",
  readOnly: true,
  onDateValueChange: fn(),
};
