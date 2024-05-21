import { DatePicker, DatePickerProps } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Date Picker",
  component: DatePicker,
} as Meta<typeof DatePicker>;

const DatePickerTemplate: StoryFn<DatePickerProps> = (args) => {
  return <DatePicker {...args} />;
};

export const Default = DatePickerTemplate.bind({});
Default.args = {};

export const Range = DatePickerTemplate.bind({});
Range.args = {
  selectionVariant: "range",
};
