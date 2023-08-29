import { ReactElement } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

export const Error = (): ReactElement => {
  return (
    <RadioButtonGroup validationStatus="error">
      <RadioButton label="Error" value="Error-unchecked" />
      <RadioButton label="Error" value="Error-checked" checked />
    </RadioButtonGroup>
  );
};
