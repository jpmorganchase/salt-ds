import { FlexLayout, StackLayout } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  DateInputRange,
  type DateInputRangeDetails,
  type DateInputRangeProps,
  DateInputSingle,
  type DateInputSingleDetails,
  type DateInputSingleProps,
  type DateRangeSelection,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "@storybook/test";
import { type SyntheticEvent, useState } from "react";

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
    date: TDate | null,
    details: DateInputSingleDetails,
  ) {
    console.log(
      `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
    );
    const { value, errors } = details;
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
    args?.onDateChange?.(event, date, details);
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
    event: SyntheticEvent,
    date: DateRangeSelection<Date> | null,
    details: DateInputRangeDetails,
  ) {
    const { startDate, endDate } = date || {};
    const {
      startDate: {
        value: startDateOriginalValue,
        errors: startDateErrors,
      } = {},
      endDate: { value: endDateOriginalValue, errors: endDateErrors } = {},
    } = details;
    console.log(
      `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
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
    args?.onDateChange?.(event, date, details);
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

export const ControlledSingle: StoryFn<
  DateInputSingleProps<DateFrameworkType>
> = (args) => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(args?.date ?? null);

  function handleDateChange<TDate extends DateFrameworkType>(
    event: SyntheticEvent,
    date: TDate | null,
    details: DateInputSingleDetails,
  ) {
    console.log(
      `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
    );
    const { value, errors } = details;
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
    setSelectedDate(date);
    args?.onDateChange?.(event, date, details);
  }

  return (
    <StackLayout style={{ width: "400px" }}>
      <DateInputSingle
        date={selectedDate}
        onDateChange={handleDateChange}
        {...args}
      />

      <FlexLayout>
        <button onClick={() => setSelectedDate(null)}>Set null</button>
        <button onClick={() => setSelectedDate(new Date())}>Set today</button>
        <button
          onClick={() =>
            setSelectedDate(dateAdapter.add(new Date(), { days: 1 }))
          }
        >
          Set tomorrow
        </button>
      </FlexLayout>
    </StackLayout>
  );
};
