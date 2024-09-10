import {
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { Slider, type SliderProps, type SliderValue } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { type ChangeEvent, useEffect, useState } from "react";

const validateSingle = (value: string, bounds: [number, number]) => {
  if (Number.isNaN(Number(value))) return false;
  if (Number(value) < bounds[0] || Number(value) > bounds[1]) return false;
  return true;
};

const validateRange = (values: [string, string], bounds: [number, number]) => {
  if (values.length !== 2) return false;
  const [min, max] = values;
  const minValid = validateSingle(min, bounds);
  const maxValid = validateSingle(max, bounds);
  if (!minValid || !maxValid) return false;
  if (Number(min) > Number(max)) return false;
  return true;
};

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

export const WithNegativeBounds = Template.bind({});
WithNegativeBounds.args = {
  min: -5,
  max: 5,
  "aria-label": "WithNegativeBounds",
};

export const CustomStep = () => (
  <StackLayout gap={10} style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Step: 1 (default)</FormFieldLabel>
      <Slider min={-1} max={1} marks="all" />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.2</FormFieldLabel>
      <Slider min={-1} max={1} step={0.2} marks="all" />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.25 (two decimal places)</FormFieldLabel>
      <Slider min={-1} max={1} step={0.25} marks="all" />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.3 (not multiple of total range)</FormFieldLabel>
      <Slider min={0} max={1} step={0.3} marks="all" defaultValue={[0.9]} />
    </FormField>
  </StackLayout>
);

export const BottomMarks = Template.bind({});
BottomMarks.args = {
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
  const [inputValue, setInputValue] = useState<string>(value[0].toString());
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    if (Number.isNaN(Number(inputValue))) return;
    setValue([+inputValue]);
  };

  const handleChange = (value: SliderValue) => {
    setInputValue(value[0].toString());
    setValue([+inputValue]);
  };

  useEffect(() => {
    const valid = validateSingle(inputValue, bounds);
    setValidationStatus(valid ? undefined : "error");
  }, [inputValue]);

  return (
    <FormField>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FlexLayout gap={1}>
        <Input
          value={inputValue}
          style={{ width: "10px" }}
          onChange={handleInputChange}
          validationStatus={validationStatus}
        />
        <Slider
          style={{ width: "300px" }}
          min={bounds[0]}
          max={bounds[1]}
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

export const RangeWithInput = () => {
  const bounds: [number, number] = [0, 50];

  const [value, setValue] = useState<SliderValue>([0, 50]);
  const [minValue, setMinValue] = useState<string>(bounds[0].toString());
  const [maxValue, setMaxValue] = useState<string>(bounds[1].toString());
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );

  const handleMinInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setMinValue(inputValue);
  };

  const handleMaxInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setMaxValue(inputValue);
  };

  const handleSliderChange = (value: SliderValue) => {
    if (typeof value[1] === "undefined") return false;
    setValue(value);
    setMinValue(value[0].toString());
    setMaxValue(value[1].toString());
  };

  useEffect(() => {
    const valid = validateRange([minValue, maxValue], bounds);
    setValidationStatus(valid ? undefined : "error");
    if (valid) {
      setValue([Number(minValue), Number(maxValue)]);
    }
  }, [minValue, maxValue]);

  return (
    <FormField>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
      <FlexLayout gap={1} align="center">
        <Input
          placeholder={minValue}
          value={minValue}
          style={{ width: "10px" }}
          onChange={handleMinInputChange}
          validationStatus={validationStatus}
        />
        <Slider
          style={{ width: "300px" }}
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          onChange={handleSliderChange}
          aria-label="withInput"
        />
        <Input
          placeholder={maxValue}
          value={maxValue}
          style={{ width: "10px" }}
          onChange={handleMaxInputChange}
          validationStatus={validationStatus}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithFormField = () => (
  <StackLayout style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider marks="bottom" min={0} max={50} step={10} />
    </FormField>
    <FormField>
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider
        defaultValue={[20, 80]}
        marks="bottom"
        min={0}
        max={100}
        step={10}
      />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider min={0} max={100} />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Field Label</FormFieldLabel>
      <Slider defaultValue={[20, 80]} min={0} max={100} />
    </FormField>
  </StackLayout>
);
