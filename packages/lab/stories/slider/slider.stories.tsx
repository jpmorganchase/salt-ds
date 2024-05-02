import { Input, FormField, FormFieldLabel } from "@salt-ds/core";
import { Slider, SliderProps } from "@salt-ds/lab";
import { useState, ChangeEvent } from "react";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const Template: StoryFn<SliderProps> = ({ ...args }) => (
  <Slider style={{ width: "300px" }} {...args} />
);

export const Default = Template.bind({});
Default.args = {
  min: 0,
  max: 10,
  "aria-label": "default",
};

export const NonZeroInput = Template.bind({});
NonZeroInput.args = {
  min: -5,
  max: 5,
  "aria-label": "NonZeroInput",
};

export const CustomStep = Template.bind({});
CustomStep.args = {
  min: -1,
  max: 1,
  step: 0.2,
  marks: "all",
  "aria-label": "CustomStep",
};

export const BottomLabel = Template.bind({});
BottomLabel.args = {
  marks: "bottom",
  "aria-label": "CustomStep",
};

export const WithMarks = Template.bind({});
WithMarks.args = {
  min: -5,
  max: 5,
  marks: "all",
  "aria-label": "withMarks",
};

export const WithInput = () => {
  const [value, setValue] = useState<number>(5);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value as unknown;
    setValue(inputValue as number);
  };

  const handleChange = (value: number) => {
    setValue(value);
  };

  return (
    <FormField>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Input
          placeholder="value"
          style={{ width: "1px", margin: "5px" }}
          onChange={handleInputChange}
        />
        <Slider
          style={{ width: "300px" }}
          min={-50}
          max={50}
          value={value}
          onChange={handleChange}
          aria-label="withInput"
        />
      </div>
    </FormField>
  );
};
