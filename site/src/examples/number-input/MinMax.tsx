import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { useState } from "react";

export const MinMax = () => {
  const [value, setValue] = useState<string>("2");

  const { announce } = useAriaAnnouncer();

  const max = 5;
  const min = 0;

  const getValidationStatus = () => {
    const currentValue = Number.parseFloat(value);
    if (
      !Number.isNaN(currentValue) &&
      (currentValue > max || currentValue < min)
    ) {
      return "error";
    }
    return undefined;
  };

  return (
    <FormField
      validationStatus={getValidationStatus()}
      style={{ width: "256px" }}
    >
      <FormFieldLabel>Number input with limited range</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue);
        }}
        onNumberChange={(_event, newValue) => {
          console.log(`Number changed to ${newValue}`);
          if (
            newValue !== null &&
            !Number.isNaN(newValue) &&
            (newValue > max || newValue < min)
          ) {
            announce(
              `Invalid value, please enter a value between ${min} and ${max}`,
              1000,
            );
          }
        }}
        max={max}
        min={min}
      />
      <FormFieldHelperText>
        Please enter a value between {min} and {max}
      </FormFieldHelperText>
    </FormField>
  );
};
