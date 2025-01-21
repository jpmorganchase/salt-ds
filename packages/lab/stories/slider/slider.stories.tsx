import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { Slider, type SliderProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { type ChangeEvent, useEffect, useState } from "react";

export default {
  title: "Lab/Slider",
  component: Slider,
};

const Template: StoryFn = ({ ...args }) => {
  return (
    <div style={{ width: "500px" }}>
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
  defaultValue: 30,
  "aria-label": "WithBottomLabels",
  labelPosition: "bottom",
};

export const withCustomMinMaxLabels = Template.bind({});
withCustomMinMaxLabels.args = {
  min: 0,
  max: 50,
  defaultValue: 24,
  minLabel: "Lowest value",
  maxLabel: "Highest value",
  labelPosition: "bottom",
  "aria-label": "WithCustomMinMaxLabels",
};

export const WithFormatting = Template.bind({});
WithFormatting.args = {
  min: 0,
  max: 50,
  labelPosition: "bottom",
  defaultValue: 25,
  "aria-label": "WithFormatting",
  format: (value: number) =>
    Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value),
};

export const Disabled = Template.bind({});
Disabled.args = {
  min: 0,
  max: 50,
  labelPosition: "bottom",
  defaultValue: 35,
  "aria-label": "WithFormatting",
  disabled: true,
};

export const WithMarks = Template.bind({});
WithMarks.args = {
  min: 0,
  max: 10,
  defaultValue: 5,
  markers: [
    {
      label: "5",
      value: 5,
    },
    {
      label: "8",
      value: 8,
    },
  ],
  "aria-label": "With Markers",
};

export const WithinFormFieldAndInlineLabels: StoryFn<SliderProps> = () => {
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
      <FlexLayout gap={3}>
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
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithinFormFieldAndBottomLabels: StoryFn<SliderProps> = () => {
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
      <FlexLayout gap={3}>
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
          labelPosition="bottom"
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithCustomStep = () => (
  <StackLayout gap={10} style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Step: 1 (default)</FormFieldLabel>
      <Slider min={-1} max={1} />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.2</FormFieldLabel>
      <Slider min={-1} max={1} step={0.2} />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.25 (two decimal places)</FormFieldLabel>
      <Slider min={-1} max={1} step={0.25} />
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
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
  </StackLayout>
);

export const WithNonNumericValues = () => {
  const [value, setValue] = useState<number>();

  const daysOfTheWeek = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 7 },
  ];

  const getDayOfTheWeek = (value?: number) => {
    const day = daysOfTheWeek.find((day) => day.value === value);
    return day ? day.label : "";
  };

  return (
    <div style={{ width: "500px" }}>
      <Slider
        aria-valuetext={getDayOfTheWeek(value)}
        minLabel={"Monday"}
        maxLabel={"Sunday"}
        min={1}
        max={7}
        value={value}
        onChange={(e, value) => setValue(value)}
        format={getDayOfTheWeek}
        markers={daysOfTheWeek.map((day) => {
          return { value: day.value, label: day.label };
        })}
      />
    </div>
  );
};
