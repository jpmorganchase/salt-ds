import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";
import { useState } from "react";

export const MinMax = () => {
  const [min, setMin] = useState<number | undefined>(1);
  const [max, setMax] = useState<number | undefined>(10);
  const [value, setValue] = useState<number | undefined>(2);

  const hasError = value !== undefined && min !== undefined && max !== undefined && (value < min || value > max);

  return (
    <StackLayout style={{ width: "256px" }}>
      <StackLayout direction={"row"}>
        <FormField>
          <FormFieldLabel>Min</FormFieldLabel>
          <NumberInput
            value={min}
            onValueChange={(value) => setMin(value.floatValue)}
          />
          <FormFieldHelperText>Enter a minimum value</FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Max</FormFieldLabel>
          <NumberInput
            value={max}
            onValueChange={(value) => setMax(value.floatValue)}
          />
          <FormFieldHelperText>Enter a maximum value</FormFieldHelperText>
        </FormField>
      </StackLayout>
      <FormField validationStatus={hasError ? "error" : undefined}>
        <FormFieldLabel>Number input with Formfield error</FormFieldLabel>
        <NumberInput
          value={value}
          onValueChange={(value) => setValue(value.floatValue)}
          max={max}
          min={min}
        />
        <FormFieldHelperText>
          Value must be between {min} and {max}
        </FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
