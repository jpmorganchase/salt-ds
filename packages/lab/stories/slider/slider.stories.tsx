import { Input, FormField, FormFieldLabel, useId } from "@salt-ds/core";
import { Slider, SliderProps } from "@salt-ds/lab";
import { useState, ChangeEvent } from "react";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const Template: StoryFn<SliderProps> = ({ ...args }) => {
  const id = useId();

  return <Slider style={{ width: "300px" }} {...args}></Slider>;
};

export const Default = Template.bind({});
Default.args = {
  min: 0,
  max: 10,
};

export const BottomLabel = Template.bind({});
BottomLabel.args = {
  min: 0,
  max: 10,
  labelBottom: true,
};

export const NonZeroInput = Template.bind({});
NonZeroInput.args = {
  min: -5,
  max: 5,
};

export const WithMarks = Template.bind({});
WithMarks.args = {
  min: -5,
  max: 5,
  showMarks: true,
};

export const WithInput = () => {
  const [value, setValue] = useState<number>(5);
  const max = 50;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
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
        }}
      >
        <Input
          placeholder="value"
          style={{ width: "1px", margin: "5px" }}
          onChange={handleInputChange}
        />
        <Slider
          style={{ width: "300px" }}
          min={0}
          max={max}
          value={value}
          onChange={handleChange}
        />
      </div>
    </FormField>
  );
};
