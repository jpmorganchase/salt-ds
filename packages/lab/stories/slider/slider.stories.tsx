import { Button, Card, Checkbox } from "@salt-ds/core";
import { Slider, SliderProps } from "@salt-ds/lab";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const SliderTemplate: StoryFn<SliderProps> = (args) => {
  return <Slider {...args} />;
};

const SliderOnACardTemplate: StoryFn<SliderProps> = (props) => {
  return (
    <Card>
      <Checkbox label="Coffee" />
      <Checkbox label="Black Tea" />
      <Checkbox label="Green Tea" />
      <Slider label="Sugar" min={0} max={5} defaultValue={1} />
      <Slider
        label="Milk"
        defaultValue={50}
        marks={[0, 10, 50, { value: 100, label: "100% Milk" }]}
        {...props}
      />
      <Checkbox label="Iced" />
      <Button>Start</Button>
    </Card>
  );
};

export const Simple = SliderTemplate.bind({});

export const Range = SliderTemplate.bind({});

export const Stacked = SliderOnACardTemplate.bind({});

Simple.args = {
  defaultValue: 30,
  min: 0,
  max: 60,
  label: "Simple slider",
};

Range.args = {
  defaultValue: [-30, 0, 30],
  pushable: true,
  pushDistance: 10,
  min: -50,
  max: 50,
  step: 5,
  pageStep: 25,
  label: "Range slider",
};

Stacked.args = {
  hideMarks: false,
  hideMarkLabels: false,
};
