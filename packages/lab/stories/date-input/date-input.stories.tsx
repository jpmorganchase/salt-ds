import {
  type DateFrameworkType,
  DateInputRange,
  type DateInputRangeDetails,
  type DateInputRangeProps,
  DateInputSingle,
  type DateInputSingleDetails,
  type DateInputSingleProps,
  type DateRangeSelection,
  useLocalization,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "@storybook/test";
import type { SyntheticEvent } from "react";

export default {
  title: "Lab/Date Input",
  component: DateInputSingle,
} as Meta<typeof DateInputSingle>;

const DateInputSingleTemplate: StoryFn<
  DateInputSingleProps<DateFrameworkType>
> = (args) => {
  const { dateAdapter } = useLocalization();
  function handleDateChange<TDate extends DateFrameworkType>(
    event: SyntheticEvent,
    newSelectedDate: TDate | null | undefined,
    detail: DateInputSingleDetails<TDate>,
  ) {
    console.log(
      `Selected date: ${newSelectedDate ? dateAdapter.format(newSelectedDate, "DD MMM YYYY") : newSelectedDate}`,
    );
    const { value, errors } = detail;
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
    args?.onDateChange?.(event, newSelectedDate, detail);
  }

  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle {...args} onDateChange={handleDateChange} />
    </div>
  );
};

const DateInputRangeTemplate: StoryFn<
  DateInputRangeProps<DateFrameworkType>
> = (args) => {
  const { dateAdapter } = useLocalization();
  function handleDateChange<TDate extends DateFrameworkType>(
    _event: SyntheticEvent,
    newSelectedDate: DateRangeSelection<TDate> | null,
    result: DateInputRangeDetails<TDate>,
  ) {
    const { startDate, endDate } = newSelectedDate || {};
    const {
      startDate: { value: startDateOriginalValue, errors: startDateErrors },
      endDate: { value: endDateOriginalValue, errors: endDateErrors },
    } = result;
    console.log(
      `StartDate: ${startDate ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${endDate ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
    );
    if (startDateErrors?.length) {
      console.log(
        `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
      );
      if (startDateOriginalValue) {
        console.log(`StartDate Original Value: ${startDateOriginalValue}`);
      }
    }
    if (endDateErrors?.length) {
      console.log(
        `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
      );
      if (endDateOriginalValue) {
        console.log(`EndDate Original Value: ${endDateOriginalValue}`);
      }
    }
  }
  return (
    <div style={{ width: "250px" }}>
      <DateInputRange {...args} onDateChange={handleDateChange} />
    </div>
  );
};

export const Single = DateInputSingleTemplate.bind({});
Single.args = {
  onDateValueChange: fn(),
};

export const Range = DateInputRangeTemplate.bind({});
Range.args = {
  onDateValueChange: fn(),
};

export const SingleBordered = DateInputSingleTemplate.bind({});
SingleBordered.args = {
  bordered: true,
  onDateValueChange: fn(),
};

export const RangeBordered = DateInputRangeTemplate.bind({});
RangeBordered.args = {
  bordered: true,
  onDateValueChange: fn(),
};

export const EmptyReadOnlyMarker = DateInputSingleTemplate.bind({});
EmptyReadOnlyMarker.args = {
  emptyReadOnlyMarker: "-",
  readOnly: true,
  onDateValueChange: fn(),
};
