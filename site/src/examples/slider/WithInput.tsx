import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  NumberInput,
  Slider,
} from "@salt-ds/core";
import {
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

const bounds: [number, number] = [-50, 50];

export const SingleWithInput = () => {
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

  const handleInputChange = (
    _event: SyntheticEvent | null,
    newInputValue: string,
  ) => {
    setInputValue(newInputValue);
    setValue(Number.parseFloat(newInputValue));
  };

  const handleSliderChange = (
    _e: SyntheticEvent<unknown> | Event,
    value: number,
  ) => {
    setValue(value);
    setInputValue(value.toString());
  };

  return (
    <FormField style={{ width: "80%" }}>
      <FormFieldLabel>Slider with Input</FormFieldLabel>
      <FlexLayout gap={3} align="center">
        <NumberInput
          placeholder={inputValue}
          value={inputValue}
          style={{ width: "15%" }}
          textAlign="center"
          min={bounds[0]}
          max={bounds[1]}
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
          style={{ width: "85%" }}
        />
      </FlexLayout>
    </FormField>
  );
};

export const WithInput = (): ReactElement => <SingleWithInput />;
