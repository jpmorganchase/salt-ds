import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import type { StoryFn } from "@storybook/react";
import { Slider, type SliderProps } from "packages/lab/src/slider/Slider";
import { type ChangeEvent, useEffect, useState } from "react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const Template: StoryFn = ({ ...args }) => {
  return (
    <div style={{ width: "50vw" }}>
      <Slider {...args} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  "aria-label": "default",
};

export const WithNegativeBounds = Template.bind({});
WithNegativeBounds.args = {
  min: -5,
  max: 5,
  "aria-label": "WithNegativeBounds",
};

export const WithBottomLabels = Template.bind({});
WithBottomLabels.args = {
  min: 0,
  max: 100,
  "aria-label": "WithBottomLabels",
  labelPosition: "bottom",
};

export const withCustomMinMaxLabels = Template.bind({});
withCustomMinMaxLabels.args = {
  min: 0,
  max: 50,
  minLabel: "Lowest value",
  maxLabel: "Highest value",
  labelPosition: "bottom",
};

export const WithMarks = Template.bind({});
WithMarks.args = {
  min: 0,
  max: 10,
  markers: [
    {
      label: "0",
      value: 0,
    },
    {
      label: "5",
      value: 5,
    },
    {
      label: "10",
      value: 10,
    },
  ],
  "aria-label": "With Markers",
};

export const ControlledWithInput: StoryFn<SliderProps> = () => {
  const [value, setValue] = useState<number>(5);
  const [inputValue, setInputValue] = useState<string | number>(value);
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    if (Number.isNaN(Number(inputValue))) return;
    setValue(Number.parseFloat(inputValue));
  };

  const validateSingle = (value: string | number, bounds: [number, number]) => {
    if (Number.isNaN(Number(value))) return false;
    if (Number(value) < bounds[0] || Number(value) > bounds[1]) return false;
    return true;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only need to run when inputValue and bounds change
  useEffect(() => {
    const valid = validateSingle(inputValue, bounds);
    setValidationStatus(valid ? undefined : "error");
  }, [inputValue, bounds]);

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
          onChange={(event, value) => {
            setInputValue(value);
            setValue(value);
          }}
          aria-label="withInput"
        />
      </FlexLayout>
    </FormField>
  );
};

export const CustomStep = () => (
  <StackLayout gap={10} style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Step: 1 (default)</FormFieldLabel>
      <Slider min={-1} max={1} aria-label="firstSlider" />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.2</FormFieldLabel>
      <Slider min={-1} max={1} step={0.2} aria-label="secondSlider" />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.25 (two decimal places)</FormFieldLabel>
      <Slider min={-1} max={1} step={0.25} aria-label="thirdSlider" />
    </FormField>
    <FormField>
      <FormFieldLabel>
        Step: 0.3 with formatting (not multiple of total range)
      </FormFieldLabel>
      <Slider
        min={0}
        max={1}
        step={0.3}
        defaultValue={0.9}
        aria-label="fourthSlider"
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
  </StackLayout>
);
