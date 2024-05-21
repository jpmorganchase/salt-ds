import { DateInput, DateInputProps } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { DateValue, getLocalTimeZone } from "@internationalized/date";

export default {
  title: "Lab/Date Input",
  component: DateInput,
} as Meta<typeof DateInput>;

const DateInputTemplate: StoryFn<DateInputProps> = (args) => {
  return <DateInput {...args} />;
};

const formatter = (input: DateValue | undefined): string => {
  return input
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
      }).format(input.toDate(getLocalTimeZone()))
    : "";
};

export const Default = DateInputTemplate.bind({});
Default.args = {};

export const CustomFormatter = DateInputTemplate.bind({});
CustomFormatter.args = {
  dateFormatter: formatter,
  placeholder: "yyyy",
};
