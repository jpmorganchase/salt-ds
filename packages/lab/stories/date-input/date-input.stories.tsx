import { DateInput, DateInputProps } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Date Input",
  component: DateInput,
} as Meta<typeof DateInput>;

const DateInputTemplate: StoryFn<DateInputProps> = (args) => {
  return <DateInput {...args} />;
};

export const Default = DateInputTemplate.bind({});
Default.args = {};

export const Range = DateInputTemplate.bind({});
Range.args = {
  selectionVariant: "range",
};
