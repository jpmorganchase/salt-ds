import { Button } from "@brandname/core";
import { Card, Checkbox, Slider, SliderProps } from "@brandname/lab";
import { Story } from "@storybook/react";
import "./slider.stories.css";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const SliderTemplate: Story<SliderProps> = (args) => {
  return <Slider {...args} />;
};

const SliderOnACardTemplate: Story<SliderProps> = (props) => {
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

export const SimpleSlider = SliderTemplate.bind({});

export const RangeSlider = SliderTemplate.bind({});

export const CustomSlider = SliderTemplate.bind({});

export const SliderStacked = SliderOnACardTemplate.bind({});

SimpleSlider.args = {
  defaultValue: 30,
  min: 0,
  max: 60,
  label: "Simple slider",
};

RangeSlider.args = {
  defaultValue: [-30, 0, 30],
  pushable: true,
  pushDistance: 10,
  min: -50,
  max: 50,
  step: 5,
  pageStep: 25,
  label: "Range slider",
};

CustomSlider.args = {
  className: "custom-slider",
  label: "CSS Variables Customisation",
  min: 0,
  max: 100,
  step: 5,
  marks: [
    { value: 0, label: "Off" },
    10,
    20,
    { value: 50, label: "Half" },
    80,
    90,
    { value: 100, label: "Full" },
  ],
  hideMarkLabels: false,
  hideMarks: false,
  defaultValue: [20, 40, 50],
};

SliderStacked.args = {
  hideMarks: false,
  hideMarkLabels: false,
};
