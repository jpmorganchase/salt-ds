import { ReactElement, useState } from "react";
import { Slider, SliderValue, SliderChangeHandler } from "@salt-ds/lab";
import {
  StackLayout,
  FormField,
  FormFieldLabel,
  FlexLayout,
} from "@salt-ds/core";

import { StepperInput } from "@salt-ds/lab";

export const SingleWithInput = () => {
  const [value, setValue] = useState<SliderValue>([20]);

  const handleInputChange = (value: number) => {
    setValue([value]);
  };

  const handleChange: SliderChangeHandler = (value: number[]) => {
    setValue(value);
  };

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Slider with Input</FormFieldLabel>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <StepperInput
          step={10}
          value={value[0]}
          style={{ width: "60px", margin: "5px" }}
          onChange={handleInputChange}
        />
        <Slider
          min={-50}
          max={50}
          value={value}
          onChange={handleChange}
          aria-label="withInput"
          style={{ flexGrow: 1 }}
        />
      </div>
    </FormField>
  );
};

function validate(minValue: number | string, maxValue: number | string) {
  minValue = Number(minValue);
  maxValue = Number(maxValue);

  if (minValue < 0) return false;
  if (maxValue > 100) return false;
  if (minValue > maxValue) return false;
  return true;
}

const RangeWithInput = () => {
  const [value, setValue] = useState([20, 60]);
  const [minValue, setMinValue] = useState<number>(value[0]);
  const [maxValue, setMaxValue] = useState<number>(value[1]);
  const [validationMinStatus, setMinValidationStatus] = useState<
    undefined | "error"
  >(undefined);
  const [validationMaxStatus, setMaxValidationStatus] = useState<
    undefined | "error"
  >(undefined);

  const handleMinInputChange = (inputValue: number) => {
    if (validate(inputValue, maxValue)) {
      setMinValidationStatus(undefined);
      setValue([inputValue, maxValue]);
      setMinValue(inputValue);
    } else {
      setMinValidationStatus("error");
    }
  };

  const handleMaxInputChange = (inputValue: number) => {
    if (validate(minValue, inputValue)) {
      setMaxValidationStatus(undefined);
      setValue([minValue, inputValue]);
      setMaxValue(inputValue);
    } else {
      setMaxValidationStatus("error");
    }
  };

  const handleSliderChange: SliderChangeHandler = (value: number[]) => {
    setValue(value);
    setMinValue(value[0]);
    setMaxValue(value[1]);
  };

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Slider with Input</FormFieldLabel>
      <FlexLayout gap={2} align="center">
        <StepperInput
          step={10}
          value={value[0]}
          style={{ width: "60px", margin: "5px" }}
          onChange={handleMinInputChange}
          validationStatus={validationMinStatus}
          min={0}
          max={100}
        />
        <Slider
          style={{ flexGrow: 1 }}
          min={0}
          max={100}
          value={value}
          onChange={handleSliderChange}
          aria-label="withInput"
        />
        <StepperInput
          step={10}
          value={value[1]}
          style={{ width: "60px", margin: "5px" }}
          onChange={handleMaxInputChange}
          validationStatus={validationMaxStatus}
          min={0}
          max={100}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithInput = (): ReactElement => (
  <StackLayout style={{ width: "300px" }}>
    <SingleWithInput />
    <RangeWithInput />
  </StackLayout>
);
