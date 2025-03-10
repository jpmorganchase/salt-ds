import { FlexLayout, FormField, FormFieldLabel, Input } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";

const validateSingle = (value: number, bounds: [number, number]) => {
  if (Number.isNaN(value)) return false;
  if (value < bounds[0] || value > bounds[1]) return false;
  return true;
};

export const SingleWithInput = () => {
  const bounds: [number, number] = [-50, 50];
  const [value, setValue] = useState<number>(20);
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );

  useEffect(() => {
    const valid = validateSingle(value, bounds);
    setValidationStatus(valid ? undefined : "error");
    if (valid) {
      setValue(value);
    }
  }, [value]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    setValue(Number.parseFloat(inputValue));
  };

  const handleSliderChange = (
    _e: SyntheticEvent<unknown> | Event,
    value: number,
  ) => {
    setValue(value);
    setInputValue(value.toString());
  };

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Slider with Input</FormFieldLabel>
      <FlexLayout gap={3} align="center">
        <Input
          placeholder={inputValue}
          value={inputValue}
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
          onChange={handleInputChange}
          validationStatus={validationStatus}
        />
        <Slider
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          minLabel="-50"
          maxLabel="50"
          onChange={handleSliderChange}
          style={{ flex: "100%" }}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithInput = (): ReactElement => <SingleWithInput />;
