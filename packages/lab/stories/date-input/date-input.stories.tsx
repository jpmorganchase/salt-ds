import {
  DateInputRange,
  type DateInputRangeProps,
  DateInputSingle,
  type DateInputSingleProps,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type { ReactElement } from "react";

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

export const SingleBordered = DateInputSingleTemplate.bind({});
SingleBordered.args = {
  bordered: true,
};

export const RangeBordered = DateInputSingleTemplate.bind({});
RangeBordered.args = {
  bordered: true,
};

export const EmptyReadOnlyMarker = DateInputSingleTemplate.bind({});
EmptyReadOnlyMarker.args = {
  emptyReadOnlyMarker: "-",
  readOnly: true,
};
