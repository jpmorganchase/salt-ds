import { ReactElement, useState } from "react";
import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
} from "@salt-ds/core";
import { RemoveIcon, AddIcon } from "@salt-ds/icons";
import { StepperInput } from "@salt-ds/lab";

export const CustomButtons = (): ReactElement => {
  const [value, setValue] = useState<number | string>(10);

  return (
    <FormField style={{ width: "250px" }}>
      <FormFieldLabel>Stepper Input</FormFieldLabel>
      <StepperInput
        hideButtons
        textAlign="center"
        value={value}
        onChange={(changedValue) => setValue(changedValue)}
        startAdornment={
          <Button
            aria-label="decrement value"
            onClick={() =>
              setValue(
                typeof value === "string" ? parseFloat(value) - 1 : value - 1
              )
            }
          >
            <RemoveIcon aria-hidden />
          </Button>
        }
        endAdornment={
          <Button
            aria-label="increment value"
            onClick={() =>
              setValue(
                typeof value === "string" ? parseFloat(value) + 1 : value + 1
              )
            }
          >
            <AddIcon aria-hidden />
          </Button>
        }
      />
      <FormFieldHelperText>Please enter a value</FormFieldHelperText>
    </FormField>
  );
};
