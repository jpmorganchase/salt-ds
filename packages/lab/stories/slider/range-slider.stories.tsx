import { FlexLayout, FormField, FormFieldLabel, Input } from "@salt-ds/core";
import type { StoryFn } from "@storybook/react";
import {
  RangeSlider,
  type RangeSliderProps,
} from "packages/lab/src/slider/RangeSlider";
import { toFloat } from "packages/lab/src/slider/internal/utils";
import { type ChangeEvent, type SyntheticEvent, useState } from "react";

export default {
  title: "Lab/Slider/RangeSlider",
  component: RangeSlider,
};

const Template: StoryFn = ({ ...args }) => {
  return (
    <div style={{ width: "50vw" }}>
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
  defaultValue: [0, 4],
  "aria-label": "WithBottomLabels",
  labelPosition: "bottom",
};

export const WithMarks = Template.bind({});
WithMarks.args = {
  min: 0,
  max: 10,
  defaultValue: [0, 5],
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

export const ControlledWithInput: StoryFn<RangeSliderProps> = () => {
  const [value, setValue] = useState<[number, number]>([20, 30]);
  const [minInputValue, setMinInputValue] = useState<string | number>(value[0]);
  const [maxInputValue, setMaxInputValue] = useState<string | number>(value[1]);
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );
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
    <FormField style={{ width: "30vw" }}>
      <FormFieldLabel> Slider with Input </FormFieldLabel>
      <FlexLayout gap={1}>
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
