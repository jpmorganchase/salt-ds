import { ReactElement } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

export const Warning = (): ReactElement => {
  return (
    <RadioButtonGroup validationStatus="warning">
      <RadioButton label="Warning" value="Warning-unchecked" />
      <RadioButton label="Warning" value="Warning-checked" checked />
    </RadioButtonGroup>
  );
};
