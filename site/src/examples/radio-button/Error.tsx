import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Error = (): ReactElement => {
  return (
    <RadioButtonGroup validationStatus="error">
      <RadioButton label="Error" value="Error-unchecked" />
      <RadioButton label="Error" value="Error-checked" checked />
    </RadioButtonGroup>
  );
};
