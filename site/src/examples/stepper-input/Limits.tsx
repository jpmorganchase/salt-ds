import { ReactElement, useState } from "react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StepperInput,
} from "@salt-ds/core";

export const Limits = (): ReactElement => {
  const [value, setValue] = useState<number | string>(2);
  const max = 5;
  const min = 0;

  const getValidationStatus = () => {
    if (typeof value === "number") {
      if (value > max || value < min) {
        return "error";
      }
    } else {
      const numericValue = parseFloat(value);
      if (numericValue > max || numericValue < min) {
        return "error";
      }
    }
    return undefined;
  };

  return (
    <FormField validationStatus={getValidationStatus()}>
      <FormFieldLabel>Stepper Input with limited range</FormFieldLabel>
      <StepperInput
        value={value}
        onChange={(changedValue) => setValue(changedValue)}
        max={max}
        min={min}
        style={{ width: "250px" }}
      />
      <FormFieldHelperText>
        Please enter a value between {min} and {max}.
      </FormFieldHelperText>
    </FormField>
  );
};
