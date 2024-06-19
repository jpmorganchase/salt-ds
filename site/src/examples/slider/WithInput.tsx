import { ReactElement, useState, ChangeEvent } from "react";
import { Slider, SliderValue, SliderChangeHandler } from "@salt-ds/lab";
import {
  StackLayout,
  FormField,
  FormFieldLabel,
  FlexLayout,
  Input,
} from "@salt-ds/core";

export const SingleWithInput = () => {
  const [value, setValue] = useState<SliderValue>([20]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setValue([+inputValue]);
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
        <Input
          placeholder={`${value[0]}`}
          value={`${value[0]}`}
          style={{ width: "1px", margin: "5px" }}
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

function validate(minValue: number, maxValue: number) {
  if (minValue > maxValue) return false;
  else return true;
}

const RangeWithInput = () => {
  const [value, setValue] = useState([20, 60]);
  const [minValue, setMinValue] = useState(`${value[0]}`);
  const [maxValue, setMaxValue] = useState(`${value[1]}`);
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined
  );

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
    const validated = validate(minNumVal, maxNumVal);
    validated
      ? (setValue([minNumVal, maxNumVal]), setValidationStatus(undefined))
      : setValidationStatus("error");
  };

  const handleSliderChange: SliderChangeHandler = (value: number[]) => {
    setValue(value);
    setMinValue(`${value[0]}`);
    setMaxValue(`${value[1]}`);
  };

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Slider with Input</FormFieldLabel>
      <FlexLayout gap={2} align="center">
        <Input
          placeholder={`${minValue}`}
          value={minValue}
          style={{ width: "10px", margin: "5px" }}
          onBlur={handleInputBlur}
          onChange={handleMinInputChange}
          onKeyDown={(event) => event.key === "Enter" && handleInputBlur()}
          validationStatus={validationStatus}
        />
        <Slider
          style={{ flexGrow: 1 }}
          min={0}
          max={100}
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

export const WithInput = (): ReactElement => (
  <StackLayout style={{ width: "300px" }}>
    <SingleWithInput />
    <RangeWithInput />
  </StackLayout>
);
