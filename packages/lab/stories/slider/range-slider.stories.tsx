import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { RangeSlider, type RangeSliderProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { toFloat } from "packages/lab/src/slider/internal/utils";
import { type ChangeEvent, type SyntheticEvent, useState } from "react";

export default {
  title: "Lab/RangeSlider",
  component: RangeSlider,
};

const Template: StoryFn = ({ ...args }) => {
  return (
    <div style={{ width: "300px" }}>
      <RangeSlider {...args} />
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
  defaultValue: [0, 4],
  "aria-label": "WithNegativeBounds",
};

export const WithBottomLabels = Template.bind({});
WithBottomLabels.args = {
  min: 0,
  max: 100,
  defaultValue: [20, 45],
  "aria-label": "WithBottomLabels",
  labelPosition: "bottom",
};

export const WithFormatting = Template.bind({});
WithFormatting.args = {
  min: 0,
  max: 50,
  labelPosition: "bottom",
  defaultValue: [0, 10],
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
  defaultValue: [20, 40],
  "aria-label": "WithFormatting",
  disabled: true,
};

export const WithMarks = Template.bind({});
WithMarks.args = {
  min: 0,
  max: 10,
  defaultValue: [0, 5],
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

export const WithinFormFieldAndInlineLabels: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([-20, 30]);
  const [minInputValue, setMinInputValue] = useState<string | number>(value[0]);
  const [maxInputValue, setMaxInputValue] = useState<string | number>(value[1]);
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    variant: "min" | "max",
  ) => {
    const inputValue = event.target.value;
    const sliderValues = [...value];

    variant === "min"
      ? setMinInputValue(inputValue)
      : setMaxInputValue(inputValue);

    if (variant === "min") {
      setMinInputValue(inputValue);
      sliderValues[0] = toFloat(inputValue);
    } else {
      setMaxInputValue(inputValue);
      sliderValues[1] = toFloat(inputValue);
    }

    setValue(sliderValues as [number, number]);
  };

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Range Slider with Input </FormFieldLabel>
      <FlexLayout gap={2}>
        <Input
          value={minInputValue}
          style={{ width: "10px" }}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "min")
          }
        />
        <RangeSlider
          min={bounds[0]}
          max={bounds[1]}
          step={3}
          value={value}
          onChange={(
            e: SyntheticEvent | MouseEvent,
            value: [number, number],
          ) => {
            setMinInputValue(value[0]);
            setMaxInputValue(value[1]);
            setValue(value);
          }}
          aria-label="withInput"
        />
        <Input
          value={maxInputValue}
          style={{ width: "10px" }}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "max")
          }
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithinFormFieldAndBottomLabels: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([-20, 30]);
  const [minInputValue, setMinInputValue] = useState<string | number>(value[0]);
  const [maxInputValue, setMaxInputValue] = useState<string | number>(value[1]);
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    variant: "min" | "max",
  ) => {
    const inputValue = event.target.value;
    const sliderValues = [...value];

    variant === "min"
      ? setMinInputValue(inputValue)
      : setMaxInputValue(inputValue);

    if (variant === "min") {
      setMinInputValue(inputValue);
      sliderValues[0] = toFloat(inputValue);
    } else {
      setMaxInputValue(inputValue);
      sliderValues[1] = toFloat(inputValue);
    }

    setValue(sliderValues as [number, number]);
  };

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FlexLayout gap={2}>
        <Input
          value={minInputValue}
          style={{ width: "10px" }}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "min")
          }
        />
        <RangeSlider
          min={bounds[0]}
          max={bounds[1]}
          step={3}
          value={value}
          onChange={(
            e: SyntheticEvent | MouseEvent,
            value: [number, number],
          ) => {
            setMinInputValue(value[0]);
            setMaxInputValue(value[1]);
            setValue(value);
          }}
          aria-label="withInput"
          labelPosition="bottom"
        />
        <Input
          value={maxInputValue}
          style={{ width: "10px" }}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(event, "max")
          }
        />
      </FlexLayout>
    </FormField>
  );
};

export const withCustomMinMaxLabels = Template.bind({});
withCustomMinMaxLabels.args = {
  min: 0,
  max: 50,
  defaultValue: [10, 30],
  minLabel: "Lowest value",
  maxLabel: "Highest value",
  labelPosition: "bottom",
  "aria-label": "WithCustomMinMaxLabels",
};

export const WithCustomStep = () => (
  <StackLayout gap={10} style={{ width: "400px" }}>
    <FormField>
      <FormFieldLabel>Step: 1 (default)</FormFieldLabel>
      <RangeSlider
        min={-1}
        max={1}
        defaultValue={[-1, 0]}
        aria-label="firstSlider"
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.2</FormFieldLabel>
      <RangeSlider
        min={-1}
        max={1}
        step={0.2}
        defaultValue={[-1, 0.2]}
        aria-label="secondSlider"
      />
    </FormField>
    <FormField>
      <FormFieldLabel>Step: 0.25 (two decimal places)</FormFieldLabel>
      <RangeSlider
        min={-1}
        max={1}
        step={0.25}
        defaultValue={[-1, 0.25]}
        aria-label="thirdSlider"
      />
    </FormField>
    <FormField>
      <FormFieldLabel>
        Step: 0.3 with formatting (not multiple of total range)
      </FormFieldLabel>
      <RangeSlider
        min={0}
        max={1}
        step={0.3}
        defaultValue={[0.3, 0.9]}
        aria-label="fourthSlider"
        format={(value: number) => Intl.NumberFormat().format(value)}
      />
    </FormField>
  </StackLayout>
);
