import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import {
  Slider,
  type SliderChangeHandler,
  type SliderValue,
} from "@salt-ds/lab";
import {
  type ChangeEvent,
  type ReactElement,
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
  const [value, setValue] = useState<SliderValue>([20]);
  const [inputValue, setInputValue] = useState<string>(value[0].toString());
  const [validationStatus, setValidationStatus] = useState<undefined | "error">(
    undefined,
  );
  const bounds: [number, number] = [-50, 50];

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputValue(inputValue);
  };

  const handleChange: SliderChangeHandler = (value: SliderValue) => {
    setValue(value);
  };

  useEffect(() => {
    const valid = validateSingle(inputValue, bounds);
    setValidationStatus(valid ? undefined : "error");
    setValue([+inputValue]);
  }, [inputValue]);

  return (
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Slider with Input</FormFieldLabel>
      <FlexLayout gap={1} align="center">
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

  const [value, setValue] = useState<SliderValue>([20, 60]);
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
    <FormField style={{ width: "400px" }}>
      <FormFieldLabel>Slider with Input</FormFieldLabel>
      <FlexLayout gap={1} align="center">
        <Input
          id="slider-min-value"
          placeholder={`${minValue}`}
          value={minValue}
          style={{ width: "10px" }}
          onChange={handleMinInputChange}
          validationStatus={validationStatus}
        />
        <Slider
          style={{ flexGrow: 1 }}
          min={bounds[0]}
          max={bounds[1]}
          value={value}
          onChange={handleSliderChange}
          aria-label="withInput"
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
