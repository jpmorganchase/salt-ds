import { FlexLayout, FormField, FormFieldLabel, Input } from "@salt-ds/core";
import { RangeSlider } from "@salt-ds/lab";
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

const validateRange = (values: [number, number], bounds: [number, number]) => {
  if (values.length !== 2) return false;
  const [min, max] = values;
  const minValid = validateSingle(min, bounds);
  const maxValid = validateSingle(max, bounds);
  if (!minValid || !maxValid) return false;
  if (min > max) return false;
  return true;
};

const RangeWithInput = () => {
  const bounds: [number, number] = [-50, 50];

  const [value, setValue] = useState<[number, number]>([-10, 20]);
  const [minInputValue, setMinInputValue] = useState<string>("10");
  const [maxInputValue, setMaxInputValue] = useState<string>("20");
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );

  useEffect(() => {
    const valid = validateRange(value, bounds);
    setValidationStatus(valid ? undefined : "error");
    if (valid) {
      setValue(value);
    }
  }, [value]);

  const handleMinInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setMinInputValue(inputValue);
    const newSliderValue = [...value];
    newSliderValue[0] = Number.parseFloat(inputValue);
    setValue(newSliderValue as [number, number]);
  };

  const handleMaxInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setMaxInputValue(inputValue);
    const newSliderValue = [...value];
    newSliderValue[1] = Number.parseFloat(inputValue);
    setValue(newSliderValue as [number, number]);
  };

  const handleSliderChange = (
    _e: SyntheticEvent<unknown> | Event,
    value: [number, number],
  ) => {
    setValue(value);
    setMinInputValue(value[0].toString());
    setMaxInputValue(value[1].toString());
  };

  return (
    <FormField style={{ width: "600px" }}>
      <FormFieldLabel>RangeSlider with Input</FormFieldLabel>
      <FlexLayout gap={3} align="center">
        <Input
          aria-label="Minimum input"
          id="slider-min-value"
          placeholder={minInputValue}
          value={minInputValue}
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
          onChange={handleMinInputChange}
          validationStatus={validationStatus}
        />
        <RangeSlider
          style={{ flex: 6 }}
          min={bounds[0]}
          max={bounds[1]}
          minLabel="-50"
          maxLabel="50"
          value={value}
          onChange={handleSliderChange}
        />
        <Input
          aria-label="Maximum input"
          id="slider-max-value"
          placeholder={`${maxInputValue}`}
          value={maxInputValue}
          style={{ flex: 1 }}
          inputProps={{ style: { textAlign: "center" } }}
          onChange={handleMaxInputChange}
          validationStatus={validationStatus}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithInput = (): ReactElement => <RangeWithInput />;
