import {
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";
import { Slider, type SliderProps, type SliderValue } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { type ChangeEvent, useState } from "react";

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

export const CustomStep = () => (
  <FlexLayout gap={5} direction="column" style={{ width: "300px" }}>
    <Slider min={-1} max={1} marks="all" />
    <Slider min={-1} max={1} step={0.5} marks="all" />
    <Slider min={-1} max={1} step={0.2} marks="all" />
    <Slider min={-1} max={1} step={0.25} marks="all" />
  </FlexLayout>
);

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
  const [value, setValue] = useState<SliderValue>([5]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    // TODO replace Input with StepperInput when available
    if (Number.isNaN(Number(inputValue)) && inputValue !== "-") return;

    setValue([+inputValue]);
  };

  const handleChange = (value: SliderValue) => {
    setValue(value);
  };

  return (
    <FormField>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FlexLayout gap={1}>
        <Input
          value={`${value}`}
          style={{ width: "10px" }}
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
      </FlexLayout>
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

function validate(minValue: number, maxValue: number) {
  if (minValue > maxValue) return false;
  return true;
}

export const RangeWithInput = () => {
  const [value, setValue] = useState<number[]>([0, 50]);
  const [minValue, setMinValue] = useState<number>(value[0]);
  const [maxValue, setMaxValue] = useState(value[1]);
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );

  const handleMinInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setMinValue(+inputValue);
  };

  const handleMaxInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setMaxValue(+inputValue);
  };

  const handleInputBlur = () => {
    const validated = validate(+minValue, +maxValue);

    if (validated) {
      setValue([minValue, maxValue]);
      setValidationStatus(undefined);
      return;
    }

    setValidationStatus("error");
  };

  const handleSliderChange = (value: SliderValue) => {
    const rangeValue = value as number[];
    setValue(rangeValue);
    setMinValue(rangeValue[0]);
    setMaxValue(rangeValue[1]);
  };

  return (
    <FormField>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
      <FlexLayout gap={1} align="center">
        <Input
          placeholder={`${minValue}`}
          value={minValue}
          style={{ width: "10px" }}
          onBlur={handleInputBlur}
          onChange={handleMinInputChange}
          onKeyDown={(event) => event.key === "Enter" && handleInputBlur()}
          validationStatus={validationStatus}
        />
        <Slider
          style={{ width: "300px" }}
          min={0}
          max={50}
          value={value}
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
          validationStatus={validationStatus}
        />
      </FlexLayout>
    </FormField>
  );
};
