import { Input, FormField, FormFieldLabel, FlexLayout } from "@salt-ds/core";
import { Slider, SliderProps, SliderValue } from "@salt-ds/lab";
import { useState, ChangeEvent } from "react";
import { StoryFn } from "@storybook/react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const Template: StoryFn<SliderProps> = ({ ...args }) => {
  return <Slider style={{ width: "300px" }} {...args} />;
};

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
  const [value, setValue] = useState<SliderValue>(5);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value as unknown;
    setValue(inputValue as SliderValue);
  };

  const handleChange = (value: SliderValue) => {
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

const RangeTemplate: StoryFn<SliderProps> = ({ ...args }) => {
  return <Slider style={{ width: "300px" }} {...args} />;
};

export const Range = RangeTemplate.bind({});
Range.args = {
  min: 0,
  max: 100,
  defaultValue: [20, 80],
};

export const RangeWithMarks = RangeTemplate.bind({});
RangeWithMarks.args = {
  min: 0,
  max: 100,
  step: 10,
  defaultValue: [20, 80],
  marks: "all",
};

export const RangeWithInput = () => {
  const [value, setValue] = useState([0, 50]);
  const [minValue, setMinValue] = useState(`${value[0]}`);
  const [maxValue, setMaxValue] = useState(`${value[1]}`);

  const handleMinInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setMinValue(inputValue);
  };

  const handleMaxInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setMaxValue(inputValue);
  };

  const handleInputBlur = () => {
    const minNumVal = parseFloat(minValue);
    const maxNumVal = parseFloat(maxValue);
    if (!isNaN(minNumVal) && !isNaN(maxNumVal)) {
      setValue([minNumVal, maxNumVal]);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setValue(value);
    setMinValue(`${value[0]}`);
    setMaxValue(`${value[1]}`);
  };

  return (
    <FormField>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FlexLayout gap={3} align="center">
        <Input
          placeholder={`${minValue}`}
          value={minValue}
          style={{ width: "10px", margin: "5px" }}
          onBlur={handleInputBlur}
          onChange={handleMinInputChange}
          onKeyDown={(event) => event.key === "Enter" && handleInputBlur()}
        />
        <Slider
          style={{ width: "300px" }}
          min={0}
          max={50}
          value={value}
          // @ts-ignore
          onChange={handleSliderChange}
          aria-label="withInput"
        />
        <Input
          placeholder={`${maxValue}`}
          value={maxValue}
          style={{ width: "10px" }}
          onBlur={handleInputBlur}
          onChange={handleMaxInputChange}
          onKeyDown={(event) => event.key === "Enter" && handleInputBlur()}
        />
      </FlexLayout>
    </FormField>
  );
};
