import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { useState } from "react";

export const Limits = () => {
  const [value, setValue] = useState(2);
  const max = 10;
  const min = 0;

  const isError = value > max || value < min;

  return (
    <FormField
      validationStatus={isError ? "error" : undefined}
      style={{ width: "256px" }}
    >
      <FormFieldLabel>Number input with limited range</FormFieldLabel>
      <NumberInput
        value={value}
        onChange={(_, changedValue) => setValue(changedValue)}
        max={max}
        min={min}
      />
      <FormFieldHelperText>
        Limit value must be between {min} and {max}
      </FormFieldHelperText>
    </FormField>
  );
};
