import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  DateInputRange,
  type DateInputRangeProps,
  DateInputRangeDetails,
  DateInputSingle,
  type DateInputSingleProps,
  DateInputSingleDetails,
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
    newSelectedDate: DateValue | null | undefined,
    result: DateInputSingleDetails,
  ) => {
    console.log(
      `Selected date: ${newSelectedDate ? formatDate(newSelectedDate) : newSelectedDate}`,
    );
    const { value, errors } = result;
    if (errors?.length && value) {
      console.log(
        `Error(s): ${errors
          .map(({ type, message }) => `type=${type} message=${message}`)
          .join(",")}`,
      );
      if (value) {
        console.log(`Original Value: ${value}`);
      }
    }
    args?.onDateChange?.(event, newSelectedDate, result);
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
    newSelectedDate: DateRangeSelection,
    result: DateInputRangeDetails,
  ) => {
    console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
    const {
      startDate: {
        date: startDate,
        value: startDateOriginalValue,
        errors: startDateErrors,
      },
      endDate: {
        date: endDate,
        value: endDateOriginalValue,
        errors: endDateErrors,
      },
    } = result;
    console.log(
      `Selected date range: ${formatDateRange({ startDate, endDate })}`,
    );
    if (startDateErrors?.length) {
      console.log(
        `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
      );
      if (startDateOriginalValue) {
        console.log(`Original Value: ${startDateOriginalValue}`);
      }
    }
    if (endDateErrors?.length) {
      console.log(
        `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
      );
      if (endDateOriginalValue) {
        console.log(`Original Value: ${endDateOriginalValue}`);
      }
    }
    args?.onDateChange?.(event, newSelectedDate, result);
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
