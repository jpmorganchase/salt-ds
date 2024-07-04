import {
  DateInputSingle,
  DateInputSingleProps,
  DateInputRange,
  DateInputRangeProps
} from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Date Input",
  component: DateInputSingle,
} as Meta<typeof DateInputSingle>;

const DateInputSingleTemplate: StoryFn<DateInputSingleProps> = (args) => {
  return <DateInputSingle {...args} />;
};

const DateInputRangeTemplate: StoryFn<DateInputRangeProps> = (args) => {
  return <DateInputRange {...args} />;
};

export const Single = DateInputSingleTemplate.bind({});
Single.args = {};

export const Range = DateInputRangeTemplate.bind({});
Range.args = {};

export const Bordered = DateInputSingleTemplate.bind({});
Bordered.args = {
  bordered: true,
};
