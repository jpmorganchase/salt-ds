import { ReactElement, useState } from "react";
import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
} from "@salt-ds/core";
import { RemoveIcon, AddIcon, RefreshIcon } from "@salt-ds/icons";
import { StepperInput } from "@salt-ds/lab";

export const Refresh = (): ReactElement => {
  const [value, setValue] = useState<number | string>(10);

  return (
    <FormField style={{ width: "250px" }}>
      <FormFieldLabel>Stepper Input</FormFieldLabel>
      <StepperInput
        value={value}
        onChange={(changedValue) => setValue(changedValue)}
        endAdornment={
          <Button
            variant="secondary"
            aria-label="refresh"
            onClick={() => setValue(10)}
          >
            <RefreshIcon aria-hidden />
          </Button>
        }
      />
      <FormFieldHelperText>Please enter a value</FormFieldHelperText>
    </FormField>
  );
};
