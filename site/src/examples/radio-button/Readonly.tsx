import { ReactElement } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

export const Readonly = (): ReactElement => {
  return (
    <RadioButtonGroup readOnly>
      <RadioButton label="Validate with email" value="email" />
      <RadioButton label="Validate with text message" value="text" checked />
    </RadioButtonGroup>
  );
};
