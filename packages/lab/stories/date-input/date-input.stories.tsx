import { DateInput, DateInputProps } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { ChangeEvent, useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
const localTimeZone = getLocalTimeZone();

export default {
  title: "Lab/Date Input",
  component: DateInput,
} as Meta<typeof DateInput>;

const DateInputTemplate: StoryFn<DateInputProps> = (args) => {
  return <DateInput {...args} />;
};

const formatter = (input: string): string => {
  const date = new Date(input);
  // @ts-ignore evaluating validity of date
  return isNaN(date)
    ? input
    : new Intl.DateTimeFormat("en-US", {
        year: "numeric",
      }).format(date);
};

export const Default = DateInputTemplate.bind({});
Default.args = {};

export const CustomFormatter = DateInputTemplate.bind({});
CustomFormatter.args = {
  dateFormatter: formatter,
  placeholder: "yyyy",
};
