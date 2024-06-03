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

  const isOutOfRange = () => {
    const numericValue = typeof value === "number" ? value : parseFloat(value);
    return numericValue > max || numericValue < min;
  };

  return (
    <FormField
      validationStatus={isOutOfRange() ? "error" : undefined}
      style={{ width: "250px" }}
    >
      <FormFieldLabel>Stepper Input with limited range</FormFieldLabel>
      <StepperInput
        value={value}
        onChange={(changedValue) => setValue(changedValue)}
        max={max}
        min={min}
      />
      <FormFieldHelperText>
        Please enter a value between {min} and {max}
      </FormFieldHelperText>
    </FormField>
  );
};
