import {
  DateInput,
  type DateInputProps,
  type RangeSelectionValueType,
  type SingleSelectionValueType,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Date Input",
  component: DateInput,
} as Meta<typeof DateInput>;

const DateInputTemplate: StoryFn<
  DateInputProps<SingleSelectionValueType | RangeSelectionValueType>
> = (args) => {
  return <DateInput {...args} />;
};

export const Default = DateInputTemplate.bind({});
Default.args = {};

export const Range = DateInputTemplate.bind({});
Range.args = {
  selectionVariant: "range",
};

export const Bordered = DateInputTemplate.bind({});
Bordered.args = {
  bordered: true,
};
