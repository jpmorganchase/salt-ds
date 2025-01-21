import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { RangeSlider, Slider } from "@salt-ds/lab";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";

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

export const SingleWithInput = () => {
  const [value, setValue] = useState<number>(20);
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
    setValue(Number.parseFloat(inputValue));
  };

  const handleChange = (_e: SyntheticEvent, value: number) => {
    setValue(value);
  };

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Slider with Input</FormFieldLabel>
      <FlexLayout gap={3} align="center">
        <Input
          placeholder={inputValue}
          value={inputValue}
          style={{ width: "10px" }}
          onChange={handleInputChange}
          validationStatus={validationStatus}
        />
        <Slider
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          onChange={handleChange}
          aria-label="withInput"
          style={{ flexGrow: 1 }}
        />
      </FlexLayout>
    </FormField>
  );
};

const RangeWithInput = () => {
  const bounds: [number, number] = [0, 100];

  const [value, setValue] = useState<[number, number]>([20, 60]);
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

  const handleSliderChange = (
    event: SyntheticEvent,
    value: [number, number],
  ) => {
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
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Range Slider with Input</FormFieldLabel>
      <FlexLayout gap={3} align="center">
        <Input
          id="slider-min-value"
          placeholder={`${minValue}`}
          value={minValue}
          style={{ width: "10px" }}
          onChange={handleMinInputChange}
          validationStatus={validationStatus}
        />
        <RangeSlider
          style={{ flexGrow: 1 }}
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          onChange={handleSliderChange}
          aria-label="withInput"
          labelPosition="bottom"
        />
        <Input
          id="slider-max-value"
          placeholder={`${maxValue}`}
          value={maxValue}
          style={{ width: "10px" }}
          onChange={handleMaxInputChange}
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
